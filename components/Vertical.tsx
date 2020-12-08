import Head from "next/head";
import React, { useState, useRef, useEffect, createRef, CSSProperties } from "react";
import { Provider, atom, useAtom } from "jotai";
import { Scrollbars } from "react-custom-scrollbars";
import { Editor, EditorState } from "draft-js";

import Scrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";

type classname = "root" | "container" | "wrapper" | "scroll" | "editor" | "footer" | "control";

type classMap = {
    [key in classname]: CSSProperties;
};

const styles: classMap = {
    root: {
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
    },
    container: {
        flex: 1,
        display: "flex",
        flexGrow: 1,
        flexDirection: "column",
        backgroundColor: "navajowhite",
    },
    wrapper: {
        flex: 1,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    scroll: {
        border: "1px dashed gray",
        // minWidth: "640px",
        // minHeight: "480px",
        maxWidth: "95%",
        maxHeight: "95%",
        // height: "100px",
        paddingBottom: "8px",
        // backgroundColor: "white",
    },
    editor: {
        writingMode: "vertical-rl",
        fontSize: "24px",
        textAlign: "justify",
        backgroundColor: "white",
        maxHeight: "100%",
        // height: "720px",
        minHeight: "20em",
        minWidth: "6em",
        margin: "0 auto",
    },
    footer: {
        backgroundColor: "lightgray",
        minHeight: "120px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    control: {
        backgroundColor: "white",
        width: "100px",
        height: "100px",
        margin: "8px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
};

const fontSizeAtom = atom(24);
const lineCharsAtom = atom(30);
const wrapperHeightAtom = atom(480);
const editorHeightAtom = atom((get) => get(fontSizeAtom) * get(lineCharsAtom));
const isDisabledFSAtom = atom((get) => (get(fontSizeAtom) + 4) * get(lineCharsAtom) > get(wrapperHeightAtom));
const isDisabledLCAtom = atom((get) => get(fontSizeAtom) * (get(lineCharsAtom) + 1) > get(wrapperHeightAtom));

const Footer = () => {
    const [fontSize, setFontSize] = useAtom(fontSizeAtom);
    const [lineChars, setlineChars] = useAtom(lineCharsAtom);
    const [isDisabledFS] = useAtom(isDisabledFSAtom);
    const [isDisabledLC] = useAtom(isDisabledLCAtom);

    return (
        <div style={styles.footer}>
            <div style={styles.control}>
                <p>control</p>
            </div>
            <div style={styles.control}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <button onClick={() => setFontSize((prev) => prev + 4)} disabled={fontSize >= 48 || isDisabledFS}>
                        ↑
                    </button>
                    <p>fontsize:{fontSize}</p>
                    <button onClick={() => setFontSize((prev) => prev - 4)} disabled={fontSize <= 16}>
                        ↓
                    </button>
                </div>
            </div>
            <div style={styles.control}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <button onClick={() => setlineChars((prev) => prev + 1)} disabled={lineChars >= 40 || isDisabledLC}>
                        ↑
                    </button>
                    <p>linechars:{lineChars}</p>
                    <button onClick={() => setlineChars((prev) => prev - 1)} disabled={lineChars <= 20}>
                        ↓
                    </button>
                </div>
            </div>
        </div>
    );
};

const VerticalEditor = () => {
    const [editorState, setEditorState] = useState(() => EditorState.createEmpty());
    const editor = useRef(null);
    const focusEditor = () => editor.current.focus();
    const scrollbars: React.RefObject<Scrollbars> = createRef();
    const wrapperRef: React.RefObject<HTMLDivElement> = createRef();
    const [wrapperHeight, setWrapperHeight] = useAtom(wrapperHeightAtom);

    const [fs] = useAtom(fontSizeAtom);
    const [eh] = useAtom(editorHeightAtom);

    useEffect(() => {
        focusEditor();

        const resizeObs = new ResizeObserver((entries: ReadonlyArray<ResizeObserverEntry>) => {
            const height = entries[0].contentRect.height;
            setWrapperHeight(height);
            console.log(height);
        });
        wrapperRef.current && resizeObs.observe(wrapperRef.current);

        return () => {
            resizeObs.disconnect();
        };
    }, []);

    const onMouseWheel = (e: React.WheelEvent<Scrollbars>) => {
        const currentScrollDelta = scrollbars.current?.getScrollLeft() || 0;
        scrollbars.current.scrollLeft(currentScrollDelta - Math.floor(e.deltaY / 2));
    };

    const ps = useRef<HTMLElement>();

    const onMouseWheelPS = (e: React.WheelEvent<HTMLElement>) => {
        if (ps.current) {
            if (ps.current === undefined) return;
            ps.current.scrollLeft -= e.deltaY;
        }
    };

    return (
        <>
            <Head>
                <style>{`* { margin: 0px; overflow: hidden; }`}</style>
            </Head>
            <div style={styles.root}>
                <div style={styles.container} onClick={focusEditor}>
                    <div style={styles.wrapper} ref={wrapperRef}>
                        {/* <Scrollbars
                            ref={scrollbars}
                            onWheel={onMouseWheel}
                            autoHide
                            autoHideTimeout={1000}
                            autoHideDuration={500}
                            style={{ ...styles.scroll, height: `${eh}px` }}
                        > */}
                        <Scrollbar containerRef={(ref) => (ps.current = ref)} onWheel={onMouseWheelPS} style={{ ...styles.scroll, height: `${eh}px` }}>
                            <div
                                style={{
                                    ...styles.editor,
                                    fontSize: `${fs}px`,
                                    height: `${eh}px`,
                                }}
                            >
                                <Editor ref={editor} editorState={editorState} onChange={setEditorState} placeholder="Write something!" />
                            </div>
                        </Scrollbar>
                        {/* </Scrollbars> */}
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
};

export default function VerticalEditorProvider() {
    return (
        <Provider>
            <VerticalEditor />
        </Provider>
    );
}
