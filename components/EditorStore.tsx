import Head from "next/head";
import { useRouter } from "next/router";
import fb from "firebase";
import React, { useState, useRef, useEffect, createRef } from "react";
import { RecoilRoot, useRecoilValue, useSetRecoilState } from "recoil";
import { Editor, EditorState, convertFromRaw, convertToRaw } from "draft-js";
import Scrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";

import { auth, createDraftData, readDraftData, updateDraftData, getEdittingDraftData, setEdittingDraftData } from "../lib/firebase/initFirebase";
import { realFontSizeState, wrapperHeightState, editorHeightState } from "../store/editor";
import Footer from "./Footer";
import Loader from "./Loader";

type User = {
    uid: string;
    displayName: string;
    photoURL: string;
    userID?: string;
};

const convertEditorStateFromJSON = (json: string): EditorState => {
    return EditorState.createWithContent(convertFromRaw(JSON.parse(json)));
};

const convertEditorStateToJSON = (es: EditorState): string => {
    return JSON.stringify(convertToRaw(es.getCurrentContent()));
};

const VerticalEditor = () => {
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const editor = useRef(null);
    const wrapperRef: React.RefObject<HTMLDivElement> = createRef();
    const ps = useRef<HTMLElement>();

    const setWrapperHeight = useSetRecoilState(wrapperHeightState);
    const fs = useRecoilValue(realFontSizeState);
    const eh = useRecoilValue(editorHeightState);

    const focusEditor = () => editor.current.focus();

    useEffect(() => {
        const resizeObs = new ResizeObserver((entries: ReadonlyArray<ResizeObserverEntry>) => {
            const height = entries[0].contentRect.height;
            setWrapperHeight(height);
        });
        wrapperRef.current && resizeObs.observe(wrapperRef.current);

        return () => {
            resizeObs.disconnect();
        };
    }, []);

    const router = useRouter();
    const [currentUser, setCurrentUser] = useState<null | User>(null);
    const [draftID, setDraftID] = useState<string>("no editting");

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        auth.onAuthStateChanged((user) => {
            user ? handleEdittingDraft(user) : router.push("/auth");
        });
    }, []);

    const handleEdittingDraft = async (user: fb.User) => {
        setCurrentUser(user);
        const ed = await getEdittingDraftData(user.uid);
        const { did, content } = ed;
        // console.log(did, content);
        const es = convertEditorStateFromJSON(content);
        setDraftID(did);
        setEditorState(es);
        setLoading(false);
        // focusEditor();
    };

    const setEdittingDraft = async (did, uid: string, es: EditorState) => {
        const draft = convertEditorStateToJSON(es);
        await setEdittingDraftData(did, uid, draft);
    };

    const createDraft = async (es: EditorState) => {
        const data = convertEditorStateToJSON(es);
        const dID = await createDraftData(currentUser.uid, data);
        setDraftID(dID);
        await setEdittingDraft(dID, currentUser.uid, es);
    };

    const readDraft = async () => {
        const data = await readDraftData(currentUser.uid, draftID);
        const es = JSON.parse(data);
        setEditorState(es);
    };

    const updateDraft = async (es: EditorState) => {
        const data = convertEditorStateToJSON(es);
        await updateDraftData(draftID, currentUser.uid, data);
        await setEdittingDraftData(draftID, currentUser.uid, data);
        setIsSaved(true);
    };

    const onMouseWheelPS = (e: React.WheelEvent<HTMLElement>) => {
        if (ps.current) {
            ps.current.scrollLeft -= e.deltaY;
        }
    };

    const [isSaved, setIsSaved] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!isSaved) updateDraft(editorState);
        }, 5000);
        return () => clearTimeout(timer);
    }, [editorState]);

    const handleEditorStateChange = (es: EditorState) => {
        setIsSaved(false);
        setEditorState(es);
    };

    return (
        <>
            <Head>
                <style>{`* { margin: 0px; overflow: hidden; }`}</style>
            </Head>
            <div className="fixed top-0 w-full">
                <div className="flex justify-center items-center" style={{ minHeight: "60px" }}>
                    {/* <button className="p-2" onClick={() => createDraft(editorState)}>
                        create
                    </button> */}
                    {/* <p className="p-2">{draftID}</p> */}
                    {/* <button className="p-2" onClick={() => updateDraft(editorState)}>
                        update
                    </button> */}
                </div>
            </div>
            <div className={"min-h-screen flex flex-col"}>
                <div className={"flex-1 flex flex-col flex-grow"}>
                    {/* <div className={"flex-1 flex flex-col flex-grow bg-yellow-100"} onClick={focusEditor}> */}
                    <div className={"flex-1 flex-center"} ref={wrapperRef}>
                        {loading ? (
                            <Loader />
                        ) : (
                            <Scrollbar
                                containerRef={(ref) => (ps.current = ref)}
                                onWheel={onMouseWheelPS}
                                className="border border-dashed border-gray-400 pb-2"
                                style={{ maxHeight: "95%", maxWidth: "95%", height: `${eh}px` }}
                            >
                                <div
                                    className="writing-v-rl text-justify bg-white max-h-full"
                                    style={{ minHeight: "20em", minWidth: "5em", fontSize: `${fs}px`, height: `${eh}px` }}
                                >
                                    <Editor editorKey="editor" ref={editor} editorState={editorState} onChange={handleEditorStateChange} />
                                </div>
                            </Scrollbar>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default function VerticalEditorProvider() {
    return (
        <RecoilRoot>
            <VerticalEditor />
        </RecoilRoot>
    );
}