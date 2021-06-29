type Page = {
    [key: string]: number;
};

type Query = {
    id: number;
    name: string;
    volume: number;
};

type Sentiment = {
    negative?: number;
    neutral?: number;
    positive?: number;
};

type TopicDays = {
    date: string;
    volume: number;
};

export type Topic = {
    burst: number;
    days: TopicDays[];
    id: string;
    label: string;
    pageType: Page;
    queries: Query[];
    sentiment: Sentiment;
    sentimentScore: number;
    volume: number;
};