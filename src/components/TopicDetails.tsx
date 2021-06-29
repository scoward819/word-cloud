import {
    FunctionComponent,
    ReactElement,
    Fragment
} from 'react';
import { Topic } from '../topic';
import '../stylesheets/TopicDetails.css';

interface ITopicDetailsProps {
    /**
     * A topic.
     */
    topic: Topic;
}

export const TopicDetails: FunctionComponent<ITopicDetailsProps> = (props): ReactElement => {
    const negativeMentions: number = props.topic.sentiment?.negative ? props.topic.sentiment.negative : 0,
        neutralMentions: number = props.topic.sentiment?.neutral ? props.topic.sentiment.neutral : 0,
        positiveMentions: number = props.topic.sentiment?.positive ? props.topic.sentiment.positive : 0;

    return (
        <div className={`word-cloud-details`}>
            {
                Object.keys(props.topic).length > 0 &&
                <Fragment>
                    <div>Information on topic "{props.topic.label}":</div>
                    <br />
                    <div>Total Mentions: {props.topic.volume}</div>
                    <br />
                    <div>Positive Mentions: <span className={`positive-mentions`}>{positiveMentions}</span></div>
                    <div>Neutral Mentions: {neutralMentions}</div>
                    <div>Negative Mentions: <span className={`negative-mentions`}>{negativeMentions}</span></div>
                </Fragment>
            }
        </div>
    );
}