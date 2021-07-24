import {NEWS_API_TOKEN} from "@env"


// the possible endpoints available to the application which is specified here: https://newsapi.org/docs
enum Endpoints {
    EVERYTHING = "everything",
    TOP_HEADLINES = "top-headlines"
}

// the possible lanugage options for the news api, we've set the default to en (English)
enum Language {
    ARABIC = "ar",
    GERMAN = "de",
    ENGLISH = "en",
    SPANISH = "es",
    FRENCH = "fr",
    HEBREW = "he",
    ITALIAN = "it",
    DUTCH = "nl",
    NORWEGIAN = "no",
    PORTUGUESE = "pt",
    RUSSIAN = "ru",
    NORTHERN_SAMI = "se", 
    CHINESE = "zh",
    ud = "ud" // this was provided in the documentation, but there is no definition for it under ISO-639-1 (also appears to return nothing?) 
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
export interface RequestConfig {
    endpoint?: Endpoints, // the possible endpoints we can pick from either EndPoint.EVERYTHING | EndPoint.TOP_HEADLINES
    q: string, // the query you want to search for e.g. technology
    qInTitle?: string, // keywords or phrases to search for in the article title only.
    domains?: Domains, // either a string or array of strings this will be used to filter out domains.
    excludeDomains?: Domains, // either a string or array of string that will be used to exclude domains
    from?: Date | string, // A date and optional time for the oldest article allowed. This should be in ISO 8601 format (e.g. 2021-07-19 or 2021-07-19T03:41:00) 
    to?: Date | string, // A date and optional time for the newest article allowed. This should be in ISO 8601 format (e.g. 2021-07-19 or 2021-07-19T03:41:00) 
    language?: Language, // The 2-letter ISO-639-1 code of the language you want to get headlines for. Possible options: ar de en es fr he it nl no pt ru se ud zh. 
    sortBy?: SortBy, // The order to sort the articles in. Possible options: relevancy, popularity, publishedAt
    pageSize?: number, // The number of results to return per page. Default: 100. Maximum: 100.
    page?: number // Use this to page through the results. Default: 1
    apiKey?: string // the api key used to fetch the data from https://newsapi.org/
}

// possible response status's either 'ok' or 'error'. Error will return a code and a message (hence why it's optional in the response data type)
type ResponseStatus = 'ok' | 'error';

// the response data that you can get back, totalResult. Status. articles. code and message if there's an error.
export interface ResponseData {
    totalResult: number, // total results returned 
    status: ResponseStatus, // the status of the request
    articles: Array<Article>, // the articles found from the api
    code?: string,  // the status code (if there's an error)
    message?: string // the error message (if there is an error)
}

enum Error {
    API_KEY_MISSING = 'API_KEY MISSING',
    PAGE_SIZE_UNDEFINED = 'pageSize undefined',
    PAGE_SIZE_OUT_OF_BOUNDS = 'pageSize out of bounds',
    INVALID_DATE_FORMAT = 'Invalid Date format provided. Please make sure it uses the ISO 8601 format (e.g. 2021-07-20 or 2021-07-20T15:40:24)'
}

const DateRegex : RegExp = new RegExp("^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])T(2[0-3]|[01][0-9]):([0-5][0-9]):([0-5][0-9])(.[0-9]+)?(Z)?$");

function convertDateStringToDateObj(date: Date | string) : Date {
    return typeof date === "string" ? new Date(date) : date;
}

function isValidDate(date: Date | string) : boolean {
    const dateObj = convertDateStringToDateObj(date);
    return DateRegex.test(dateObj.toISOString());
}

function isValidRequestConfig(config: Partial<RequestConfig>, reject: (reason?: any) => void) {
    // checking if there is a api key, otherwise we cannot continue.
    if(!config.apiKey) {
        reject(NewsApi.Error.API_KEY_MISSING);
    }

    // checking if the pageSize was passed a property (as it should be defined by default)
    if(config.pageSize) {
        // if the pagesize is < 1 or > 100 it's out of bounds. Reject the current promise.
        if(config.pageSize < 1 || config.pageSize > 100) {
            reject(NewsApi.Error.PAGE_SIZE_OUT_OF_BOUNDS);
        }
    } else {
        // there should be a pageSize by default
        reject(NewsApi.Error.PAGE_SIZE_UNDEFINED);
    }

    // checking ISO 8601 format (e.g. 2021-07-20 or 2021-07-20T15:40:24) 
    if(config.to) {
        if(!isValidDate(config.to)) {
            // TODO: debug 
            reject(NewsApi.Error.INVALID_DATE_FORMAT);
        }
    }

    if(config.from) {
        if(!isValidDate(config.from)) {
            reject(NewsApi.Error.INVALID_DATE_FORMAT);
        }
    }
}

// the news api class which is currently being used a namespace for all of our important functions / variable types
export class NewsApi {
    static readonly Endpoints = Endpoints; // the possible endpoints instead of import {EndPoint} from 'newsapi' we can use NewsApi.Endpoints.EVERYTHING or NewsApi.Endpoints.TOP_HEADLINES
    static readonly Languages = Language; // the possible languages you can selected from 
    static readonly Error = Error; // the possible error messages that might be displayed.
    // the default configuration which will be merged later on when making a request to fill in defaults like sortBy and language.
    static readonly defaultConfiguration : RequestConfig = {
        q: "", // consider this is required by default there should be no reason that the query should be blank.
        endpoint : Endpoints.EVERYTHING, // setting the default endpoint to everything 
        language : Language.ENGLISH, // setting the default language to english as it's commonly used.
        sortBy: SortBy.publishedAt, // setting the default to publishedAt so we get the newest articles first.
        pageSize: 100, // default page size is 100 stated by the api.
        page: 1, // default page number
        apiKey : NEWS_API_TOKEN // the api key which is taken from the env file. It's been created like this, so the developer doesn't have to keep typing or passing the API key around. (please never commit your .env files)
    }

    // a static function which you could call a request factory that generates Promise<Response> from the data provided by the developer or user.
    static async makeRequest(config?: RequestConfig) : Promise<Response> {
        return await new Promise((resolve, reject) => {
        // creating a partial request config, as we're not guranteed to have all the keys from the request config.
        const request : Partial<RequestConfig> = {...NewsApi.defaultConfiguration, ...config}; // merging the default config and the config provided to create a new request config
        
        // checking that the config is valid.
        isValidRequestConfig(request, reject);

        // creating a fetchURL string which will be built up over time from the records passed by the user (key, value);
        let fetchURL = `https://newsapi.org/v2/${request.endpoint}?`;

        // removing the endpoint from the request as it's already been used and will no longer be needed.
        delete request.endpoint;

        if(request.to) {
            request.to = convertDateStringToDateObj(request.to);
            request.to = request.to.toISOString().substring(0,10);
        }

        if(request.from) {
            request.from = convertDateStringToDateObj(request.from);
            request.from = request.from.toISOString().substring(0,10);
        }

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
        // return await fetch(fetchURL);

        resolve(fetch(fetchURL));
    });
    }

}

export default NewsApi;