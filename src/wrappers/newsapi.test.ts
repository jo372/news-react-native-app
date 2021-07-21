import { textSpanIntersection } from "typescript";
import NewsApi, { requestConfig } from "./newsapi";

// testing if the apikey is ever missing (undefined) i.e. the user hasn't created a .env file, it should return an error.

describe(`it should return '${NewsApi.Error.API_KEY_MISSING}'`, () => {
    it('when no API_KEY is provided / file hasn\'t been created', async() => {
        const requestConf : requestConfig = {
            q: "technology",
            apiKey : undefined
        };
        const request = NewsApi.makeRequest(requestConf); 
        expect(request).rejects.toBe(NewsApi.Error.API_KEY_MISSING);
    })
})

// it should return out of bounds under these conditions
describe(`it should return '${NewsApi.Error.PAGE_SIZE_OUT_OF_BOUNDS}'`, () => {
    it('when the number is below 0', async() => {
        const requestConf : requestConfig = {
            q: "technology",
            pageSize: -1
        };
        const request = NewsApi.makeRequest(requestConf);
        expect(request).rejects.toBe(NewsApi.Error.PAGE_SIZE_OUT_OF_BOUNDS);
    });
    it('when the number is higher than 100', async() => {
        const requestConf : requestConfig = {
            q: "technology",
            pageSize : 101
        };
        const request = NewsApi.makeRequest(requestConf);
        expect(request).rejects.toBe(NewsApi.Error.PAGE_SIZE_OUT_OF_BOUNDS);
    });
    it(`it should return ${NewsApi.Error.PAGE_SIZE_UNDEFINED} when pageSize is never declared`, async() => {
        const requestConf : requestConfig = {
            q: "technology",
            pageSize : undefined
        };
        const request = NewsApi.makeRequest(requestConf);
        expect(request).rejects.toBe(NewsApi.Error.PAGE_SIZE_UNDEFINED);
    });
});
