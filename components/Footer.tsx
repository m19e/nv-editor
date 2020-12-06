import React, { CSSProperties } from "react";

type classname = "footer" | "control";

type classMap = {
    [key in classname]: CSSProperties;
};

const styles: classMap = {
    footer: {
        backgroundColor: "lightgray",
        minHeight: "120px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
    control: {
        backgroundColor: "white",
        width: "90px",
        height: "90px",
        margin: "8px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
    },
};

export default function Footer() {
    return (
        <div style={styles.footer}>
            <div style={styles.control}>
                <p>control</p>
            </div>
            <div style={styles.control}>
                <p>control</p>
            </div>
            <div style={styles.control}>
                <p>control</p>
            </div>
        </div>
    );
}
