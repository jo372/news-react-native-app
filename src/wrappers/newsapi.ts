import {NEWS_API_TOKEN} from "@env"

enum Endpoints {
    EVERYTHING = "everything",
    TOP_HEADLINES = "top-headlines"
}

enum Language {
    ar = "ar",
    de = "de",
    en = "en",
    es = "es",
    fr = "fr",
    he = "he",
    it = "it",
    nl = "nl",
    no = "no",
    pt = "pt",
    ru = "ru",
    se = "se",
    ud = "ud",
    zh = "zh"
}

enum SortBy {
    relevancy = "relevancy",
    popularity = "popularity",
    publishedAt = "publishedAt"
}

type Domains = string | Array<string>; 

type ArticleSource = {
    id: string | null, 
    name: string
}

export interface Article {
    source: ArticleSource
    author: string | null,
    title: string,
    description: string,
    url: string,
    urlToImage: string,
    publisedAt: string,
    content: string 
}


export interface requestConfig {
    endpoint?: Endpoints,
    q: string,
    qInTitle?: string,
    domains?: Domains,
    excludeDomains?: Domains,
    from?: Date,
    to?: Date,
    language?: Language,
    sortBy?: SortBy,
    pageSize?: number,
    page?: number
    apiKey?: string
}

export type ResponseStatus = 'ok' | 'error';

export interface ResponseData {
    totalResult: number,
    status: ResponseStatus,
    articles: Array<Article>,
    code?: string, 
    message?: string
}

export class NewsApi {
    protected static endpoints = Endpoints;
    protected static defaultConfiguration : requestConfig = {
        q: "",
        endpoint : Endpoints.EVERYTHING,
        language : Language.en,
        sortBy: SortBy.publishedAt,
        pageSize: 100, // pageSize cannot be above 100, throw error.
        page: 1,
        apiKey : NEWS_API_TOKEN
    }
    static async makeRequest(config?: requestConfig) : Promise<Response> {
       
        const request : Partial<requestConfig> = {...NewsApi.defaultConfiguration, ...config};

        let fetchURL = `https://newsapi.org/v2/${request.endpoint}?`;

        // removing the endpoint from the request as it's already been used and will no longer be needed.
        delete request.endpoint;

        Object.entries(request).forEach((object, index:number) => {
            const [key, value] = object;

            //TODO: check if pageSize greater than 100 throw error. Throw error if apiKey not provided? even though is should be by default. But jsut incase the file wasn't created.
            if(index > 0) {
                fetchURL += '&';
            }
            fetchURL += `${key}=${value}`;

        });

        return await fetch(fetchURL);
    }

}


export default NewsApi;