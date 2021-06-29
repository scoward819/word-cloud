import {
    FunctionComponent,
    MouseEvent,
    ReactElement,
    useEffect,
    useState
} from 'react';
import { TopicDetails } from './TopicDetails';
import { WordCloud } from './WordCloud';
import { Topic } from '../topic';
import topicsJson from '../topics.json';
import '../stylesheets/App.css';

const App: FunctionComponent = (): ReactElement => {
    const [data, setData] = useState<Topic[]>([]),
        [selectedTopic, setSelectedTopic] = useState<Topic>({} as Topic);

    /**
     * Sets the selectedTopic state.
     * @param e Mouse event to determine the selected topic.
     */
    const selectTopic = (e: MouseEvent<HTMLElement>): void => {
        setSelectedTopic(data.find(d => d.id === (e.target as any).id) as Topic);
    };

    useEffect(() => {
        // Get the data from the json file.
        setData(topicsJson.topics);
    }, []);

    return (
        <div className={`app`}>
            <div className={`app-header`}>
                My Topics Challenge
            </div>
            <div className={`word-cloud-content`}>
                <WordCloud selectedTopicId={selectedTopic.id}
                    setSelectedTopic={selectTopic}
                    topics={data}
                />
                <TopicDetails topic={selectedTopic} />
            </div>
        </div>
    );
}

export default App;