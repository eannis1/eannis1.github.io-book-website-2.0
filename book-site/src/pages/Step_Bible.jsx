import { useRef, useState } from "react";
import "./Step_Bible.css"
import { useLayoutEffect } from "react";
import { useCallback } from "react";

const modules = import.meta.glob('../assets/step_bible/*.{png,jpg,jpeg,svg}',{
    eager: true,
    import: 'default',
});
const images = Object.fromEntries(
    Object.entries(modules).map(([path, url]) => [
        path.split('/').pop(),
        url,
    ])
)

function VideoEmbed({videoId, title}) {
    return (
        <iframe
            className="youtube-frame"
            src={`https://www.youtube.com/embed/${videoId}`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture; web-share" 
            referrerPolicy="strict-origin-when-cross-origin"
        />
    )

}

const DESIGN_WIDTH = 800;
const MIN_PANE = 300;

export function SplitView({ steps, src, title, direction = 'row' }) {
    const [index, setIndex] = useState(0);
    const [size, setSize] = useState(null);       // instructions pane size in px, null = CSS default
    const [dragging, setDragging] = useState(false);
    const [frameStyle, setFrameStyle] = useState({});

    const splitRef = useRef(null);
    const previewRef = useRef(null);

    const step = steps[index];
    const isFirst = index === 0;
    const isLast = index === steps.length - 1;
    const isRow = direction === 'row';


    useLayoutEffect(() => {
        const el = previewRef.current;
        if (!el) return;
        
        const update = () => {
            const { width, height } = el.getBoundingClientRect();
            if (!width || !height) return;
            
            const scale = Math.min(1, width / DESIGN_WIDTH);
            setFrameStyle({
                width: scale === 1 ? '100%' : `${DESIGN_WIDTH}px`,
                height: `${height / scale}px`,
                transform: `scale(${scale})`,

            })
        }

        update();
        const ro = new ResizeObserver(update);
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    /* ---------- dragging ---------- */
    // Keeps both sections within Min_pane
    const clampSize = useCallback((px) => {
        const rect = splitRef.current.getBoundingClientRect();
        const total = isRow ? rect.width : rect.height;
        return Math.max(MIN_PANE, Math.min(px, total - MIN_PANE));
    }, [isRow]);

    // Divider knows mouse events even if leaves divider size
    const onPointerDown = (e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        setDragging(true);
    };

    const onPointerMove = (e) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        const rect = splitRef.current.getBoundingClientRect();
        setSize(clampSize(isRow ? e.clientX - rect.left : e.clientY - rect.top));
    }

    const onPointerUp = (e) => {
        e.currentTarget.releasePointerCapture(e.pointerId);
        setDragging(false);
    }

    const onKeyDown = (e) => {
        const step = e.shiftKey ? 50 : 10;
        const current = size ?? (isRow
            ? splitRef.current.querySelector('.split-instructions').getBoundingClientRect().width
            : splitRef.current.querySelector('.split-instructions').getBoundingClientRect().height);
        const dec = isRow ? 'ArrowLeft' : 'ArrowUp';
        const inc = isRow ? 'ArrowRight' : 'ArrowDown';
        if (e.key === dec) { e.preventDefault(); setSize(clampSize(current - step)); }
        if (e.key === inc) { e.preventDefault(); setSize(clampSize(current + step)); }
    }

    const instructionStyle = size === null
        ? undefined
        : { flex: 'none', [isRow ? 'width' : 'height']: `${size}px` };

    return (
        <div 
            ref={splitRef}
            className={`split split-${direction}${dragging ? ' dragging' : ''}`}
        >
            <section className="split-instructions" style={instructionStyle}>
                <p className="step-count">
                    Step {index + 1} of {steps.length}
                </p>

                <div className="step-body">
                    <h2>{step.title}</h2>
                    {step.content}
                </div>

                <div className={"step-nav"}>
                    <button onClick={() => setIndex(index - 1)} disabled={isFirst}>
                        Back
                    </button>
                    <button onClick={() => setIndex(index + 1)} disabled={isLast}>
                        Next
                    </button>
                </div>
            </section>

            <div 
                className={"divider"}
                role="separator"
                aria-orientation={isRow ? "vertical" : "horizontal"}
                aria-label="Resize panels"
                tabIndex={0}
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                onPointerMove={onPointerMove}
                onKeyDown={onKeyDown}
                onDoubleClick={() => setSize(null)}
            >
                <span className="divider-grip" aria-hidden="true" />
            </div>


            <div className="split-preview" ref={previewRef}>
                <iframe 
                    className="split-frame" 
                    src={src}
                    title={title}
                    style={frameStyle}
                />
            </div>
        </div>
    );
}

const steps = [
    {
        title: "Introduction to Step Bible",
        content: (
            <>
                <div className="step-text">
                    <p>
                        Our site has an embedded version of StepBible.
                        This is so that you can read and learn side-by-side.
                        
                        Our embedded site automatically sets up the default settings but
                        if you were to use the site normally, the settings may be different.

                    </p>
                    <p>
                        If you were not using our site, you would have to make sure that the translation
                        is set to ESV and then click the dialog box for the next step.
                    </p>
                </div>
                <img src={images["step_bible_1.png"]} className="step-img" / >

                {/* <VideoEmbed videoId={"Y3Z9xHXo_7w"} title={"StepBible Introduction"} /> */}
            </>
        )
    },
    {
        title: "Greek Concordance - LSJ",
        content: (
            <>
                <div className="step-text">
                </div>
                <img src={images["step_bible_3.png"]} className="step-img" / >
            {/* <VideoEmbed videoId={"xk7ZtcMNJQo"} title={"Step Bible Greek Concordance"} /> */}
            </>
        )
    },
    {
        title: "Greek Dictionary (abbreviated) - LSJ",
        content: (
            <VideoEmbed videoId={"hacf3As6SBc"} title={"Step Bible Greek Dictionary"} />
        )
    }
]

// {/* <!-- Move Hebrew Concordance above Greek concordance and dictionary when all videos are done. Check this! --> */}
// <div className="card2">
// <h2>Hebrew Concordance - LSJ</h2>
// <img src={noVideo}/>
// </div>
//
// <div className="card2">
// <h2>Searching LXX: Connecting the OT and NT</h2>
// <img src={noVideo}/>
// </div>
//
// <div className="card2">
// <h2>Parsing Grammar: Hebrew</h2>
// <img src={noVideo}/>
// </div>
//
// <div className="card2">
// <h2>Parsing Grammar: Greek</h2>
// <img src={noVideo}/>
// </div>
// </div>
// </>

export function Step_Bible() {
    return (
            <SplitView
                src={"https://www.stepbible.org/?q=version=ESV&skipwelcome"}
                title={"STEP BIBLE"}
                direction="row"
                steps={steps}
            />
    );
}
