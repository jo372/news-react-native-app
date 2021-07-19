import {NEWS_API_TOKEN} from "@env"


// the possible endpoints available to the application which is specified here: https://newsapi.org/docs
enum Endpoints {
    EVERYTHING = "everything",
    TOP_HEADLINES = "top-headlines"
}

// the possible lanugage options for the news api, we've set the default to en (English)
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

// the possible options which we can sort by, default: publishedAt
enum SortBy {
    relevancy = "relevancy",
    popularity = "popularity",
    publishedAt = "publishedAt"
}

// a custom type which is used later on in requestConfig for excluding and included specific domains (used for filtering content by domain address)
type Domains = string | Array<string>; 

// used for the request config, the source is specified in the api to return this: 
/**
 * {
 *  "id": "hello",
 *  "name": "world"
 * }
 */
type ArticleSource = {
    id: string | null, 
    name: string
}

// an exported type which can be used when mapping through the articles as a response data type. This allows us to write code like this
/**
 * @Example NewsApi.makeRequest({ q: 'technology' }).then((response: Article) => <Text>response.title</Text>);
 */
export interface Article {
    source: ArticleSource // the article source which contains the id of the source and the name
    author: string | null, // the author of the article
    title: string, // the title of the article
    description: string, // a brief description of the article
    url: string, // the url to the article
    urlToImage: string, // the article image url
    publishedAt: string, // the published date
    content: string // The unformatted content of the article, where available. This is truncated to 200 chars. 
}

// the request config
export interface requestConfig {
    endpoint?: Endpoints, // the possible endpoints we can pick from either EndPoint.EVERYTHING | EndPoint.TOP_HEADLINES
    q: string, // the query you want to search for e.g. technology
    qInTitle?: string, // keywords or phrases to search for in the article title only.
    domains?: Domains, // either a string or array of strings this will be used to filter out domains.
    excludeDomains?: Domains, // either a string or array of string that will be used to exclude domains
    from?: Date, // A date and optional time for the oldest article allowed. This should be in ISO 8601 format (e.g. 2021-07-19 or 2021-07-19T03:41:00) 
    to?: Date, // A date and optional time for the newest article allowed. This should be in ISO 8601 format (e.g. 2021-07-19 or 2021-07-19T03:41:00) 
    language?: Language, // The 2-letter ISO-639-1 code of the language you want to get headlines for. Possible options: ar de en es fr he it nl no pt ru se ud zh. 
    sortBy?: SortBy, // The order to sort the articles in. Possible options: relevancy, popularity, publishedAt
    pageSize?: number, // The number of results to return per page. Default: 100. Maximum: 100.
    page?: number // Use this to page through the results. Default: 1
    apiKey?: string // the api key used to fetch the data from https://newsapi.org/
}

// possible response status's either 'ok' or 'error'. Error will return a code and a message (hence why it's optional in the response data type)
export type ResponseStatus = 'ok' | 'error';

// the response data that you can get back, totalResult. Status. articles. code and message if there's an error.
export interface ResponseData {
    totalResult: number, // total results returned 
    status: ResponseStatus, // the status of the request
    articles: Array<Article>, // the articles found from the api
    code?: string,  // the status code (if there's an error)
    message?: string // the error message (if there is an error)
}

// the news api class which is currently being used a namespace for all of our important functions / variable types
export class NewsApi {
    protected static Endpoints = Endpoints; // the possible endpoints instead of import {EndPoint} from 'newsapi' we can use NewsApi.Endpoints.EVERYTHING or NewsApi.Endpoints.TOP_HEADLINES
    // the default configuration which will be merged later on when making a request to fill in defaults like sortBy and language.
    protected static defaultConfiguration : requestConfig = {
        q: "", // consider this is required by default there should be no reason that the query should be blank.
        endpoint : Endpoints.EVERYTHING, // setting the default endpoint to everything 
        language : Language.en, // setting the default language to english as it's commonly used.
        sortBy: SortBy.publishedAt, // setting the default to publishedAt so we get the newest articles first.
        pageSize: 100, // default page size is 100 stated by the api.
        page: 1, // default page number
        apiKey : NEWS_API_TOKEN // the api key which is taken from the env file. It's been created like this, so the developer doesn't have to keep typing or passing the API key around. (please never commit your .env files)
    }

    // a static function which you could call a request factory that generates Promise<Response> from the data provided by the developer or user.
    static async makeRequest(config?: requestConfig) : Promise<Response> {
        // creating a partial request config, as we're not guranteed to have all the keys from the request config.
        const request : Partial<requestConfig> = {...NewsApi.defaultConfiguration, ...config}; // merging the default config and the config provided to create a new request config

        // creating a fetchURL string which will be built up over time from the records passed by the user (key, value);
        let fetchURL = `https://newsapi.org/v2/${request.endpoint}?`;

        // removing the endpoint from the request as it's already been used and will no longer be needed.
        delete request.endpoint;

        // looping through the entries in the request
        Object.entries(request).forEach((object, index:number) => {
            const [key, value] = object; // the key and value of the object. example q: "technology"
            // checking the index is greater than 0, if true we can start prefixing the ampersand to the fetch url.
            if(index > 0) {
                fetchURL += '&';
            }
            // adding the key value to the fetch url
            fetchURL += `${key}=${value}`;

        });
        // returning a promise back to whatever called it.
        return await fetch(fetchURL);
    }

}


export default NewsApi;