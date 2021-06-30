import {
    FunctionComponent,
    MouseEvent,
    ReactElement,
    ReactNode,
    useCallback,
    useEffect,
    useRef,
    useState
} from 'react';
import { Topic } from '../topic';
import '../stylesheets/WordCloud.css';

interface IFontSizeThresholds {
    /**
     * The size of the font.
     */
    fontSize: number;

    /**
     * The maximum threshold.
     */
    max: number;

    /**
     * The minimum threshold.
     */
    min: number;
}

interface IPoint {
    /**
     * The x coordinate of the point.
     */
    x: number;

    /**
     * The y coordinate of the point.
     */
    y: number;
}

interface IWordCloudProps {
    /**
     * The identifier of the selected topic.
     */
    selectedTopicId: string;

    /**
     * Array of topics.
     */
    topics: Topic[];

    /**
     * Sets the selectedTopic state.
     * @param e Mouse event to determine the selected topic.
     */
    setSelectedTopic(e: MouseEvent<HTMLElement>): void;
}

/**
 * The number of thresholds that determine each word's font size.
 */
const numberOfFontSizeThresholds = 6;

/**
 * The threshold to determine a negative sentiment score.
 */
const sentimentScoreNegativeThreshold = 40;

/**
 * The threshold to determine a positive sentiment score.
 */
const sentimentScorePositiveThreshold = 60;

/**
 * The maximum limit of the spiral to avoid a possible infinite loop.
 */
const spiralLimit = 360 * 10;

/**
 * The resolution of the spiral. The smaller the number the higher the resolution.
 */
const spiralResolution = 1;

/**
 * Padding applied to the word on the x axis.
 */
const xWordPadding = 2;

/**
 * Padding applied to the word on the y axis.
 */
const yWordPadding = 10;

export const WordCloud: FunctionComponent<IWordCloudProps> = (props): ReactElement => {
    const [loading, setLoading] = useState<boolean>(true),
        [resizing, setResizing] = useState<boolean>(false),
        [wordCloudStartPoint, setWordCloudStartPoint] = useState<IPoint>({ x: 0, y: 0 }),
        [wordElements, setWordElements] = useState<HTMLDivElement[]>([]),
        wordCloudContainerRef = useRef<HTMLDivElement>(null);

    /**
     * Gets the start point of the word cloud.
     * @returns A point object.
     */
    const getStartPoint = (): IPoint => {
        let point: IPoint = {
            x: 0,
            y: 0
        };

        if (wordCloudContainerRef.current) {
            point = {
                x: wordCloudContainerRef.current.offsetWidth / 2,
                y: wordCloudContainerRef.current.offsetHeight / 2
            };
        }

        return point;
    }; 

    /**
     * Generates the word elements to be rendered.
     */
    const generateWordElements = useCallback(async (): Promise<void> => {
        const cloud: HTMLElement = document.getElementById(`word-cloud`) as HTMLElement,
            maxTopicVolume: number = Math.max(...props.topics.map(t => t.volume)),
            wordsAdded: HTMLDivElement[] = [],
            wordFontSizeThresholds: IFontSizeThresholds[] = [];
        
        // Generate the thresholds for the font sizes.
        for (let i = 1; i <= numberOfFontSizeThresholds; i++) {
            const n: number = maxTopicVolume / numberOfFontSizeThresholds;
    
            wordFontSizeThresholds.push({
                fontSize: i * 12,
                max: n * i,
                min: (n * i) - n
            });
        }

        const createWord = (topic: Topic): HTMLDivElement => {
            let container = document.createElement(`div`),
                className = `word-cloud-item`;
            
            if (topic.sentimentScore > sentimentScorePositiveThreshold) {
                className += ` positive`;
            }
            else if (topic.sentimentScore < sentimentScoreNegativeThreshold) {
                className += ` negative`;
            }
            else {
                className += ` neutral`;
            }
    
            container.id = topic.id;
            container.className = className;
            container.style.fontSize = `${wordFontSizeThresholds.find(w => topic.volume > w.min && topic.volume <= w.max)?.fontSize}px`;
            container.appendChild(document.createTextNode(topic.label));
    
            return container;
        };
    
        const spiral = (i: number, word: HTMLDivElement): boolean => {
            const angle = spiralResolution * i;
    
            let x = (1 + angle) * Math.cos(angle),
                y = (1 + angle) * Math.sin(angle);
    
            x += wordCloudStartPoint.x;
            y += wordCloudStartPoint.y;
    
            if (!intersect(word, x, y)) {
                return true;
            }
    
            return false;
        };

        const intersect = (word: HTMLDivElement, x: number, y: number): boolean => {
            cloud?.appendChild(word); // Add the element briefly to the DOM so that height and width can be determined.

            // Reset positioning so that previous values aren't used.
            word.style.bottom = ``;
            word.style.left = ``;
            word.style.right = ``;
            word.style.top = ``;

            const height = word.scrollHeight,
                left = x - word.scrollWidth / 2,
                top = y - word.scrollHeight / 2;

            word.style.height = `${height}px`;
            word.style.left = `${left}px`;
            word.style.top = `${top}px`;
    
            const currentWord = word.getBoundingClientRect();
    
            cloud?.removeChild(word);

            const bottom = top + currentWord.height,
                right = left + currentWord.width;
            
            word.style.bottom = `${bottom}px`;
            word.style.right = `${right}px`;
    
            const containerRef = wordCloudContainerRef.current as HTMLDivElement;
    
            // Check if the position of the word is within the bounds of its container.
            if (
                right > containerRef.offsetLeft &&
                top > containerRef.offsetTop &&
                left < containerRef.offsetWidth &&
                bottom < containerRef.offsetHeight
            ) {
                for (let i = 0; i < wordsAdded.length; i++) {
                    const comparisonWordStyle = wordsAdded[i].style;
        
                    // Check if the current word intersects with the previously added word.
                    if (!(
                        right + xWordPadding < parseFloat(comparisonWordStyle.left.replace(`px`, ``)) - xWordPadding ||
                        left - xWordPadding > parseFloat(comparisonWordStyle.right.replace(`px`, ``)) + xWordPadding ||
                        bottom + yWordPadding < parseFloat(comparisonWordStyle.top.replace(`px`, ``)) - yWordPadding ||
                        top - yWordPadding > parseFloat(comparisonWordStyle.bottom.replace(`px`, ``)) + yWordPadding
                    )) {
                        return true;
                    }
                }
            }
    
            wordsAdded.push(word); // Word does not intersect, add it to the array.
    
            return false;
        };

        props.topics.forEach((t: Topic): void => {
            const word: HTMLDivElement = createWord(t);
    
            for (let i = 0; i < spiralLimit; i++) {
                if (spiral(i, word)) {
                    // A word has been added, break out of the loop.
                    break;
                }
            }
        });

        setWordElements(wordsAdded);
    }, [props.topics, wordCloudStartPoint]);

    useEffect(() => {
        setWordCloudStartPoint(getStartPoint());

        let timeout: NodeJS.Timeout | null;

        const windowResize = (): void => {
            setLoading(true);
            setResizing(true);

            if (timeout) {
                clearTimeout(timeout);
            }

            timeout = setTimeout(() => {
                setResizing(false);
                timeout = null;
            }, 50);
        };

        window.addEventListener(`resize`, () => {
            windowResize();
        });

        return () => {
            window.removeEventListener(`resize`, () => {
                windowResize();
            });
        };
    }, []);

    useEffect(() => {
        if (props.topics.length > 0) {
            generateWordElements();
            setLoading(false);
        }
    }, [props.topics.length, wordCloudStartPoint, generateWordElements]);

    useEffect(() => {
        if (!resizing) {
            setWordElements([]);
            setWordCloudStartPoint(getStartPoint());
        }
    }, [resizing]);

    // Loop through the word elements and create the nodes for rendering.
    const nodes: ReactNode[] = wordElements.map(a => {
        // Add 'selected' to the class name if it has been selected.
        const className = `${a.className}${a.id === props.selectedTopicId ? ` selected` : ``}`;

        return (
            <div className={className}
                id={a.id}
                key={a.id}
                onClick={props.setSelectedTopic}
                style={{
                    fontSize: a.style.fontSize,
                    left: a.style.left,
                    top: a.style.top
                }}
            >
                {a.innerHTML}
            </div>
        );
    });

    return (
        <div className={`word-cloud-container`}
            id={`word-cloud`}
            ref={wordCloudContainerRef}
        >
            {
                loading &&
                <div className={`loading`}>LOADING...</div>
            }
            {
                !loading &&
                nodes.map(n => n)
            }
        </div>
    );
}