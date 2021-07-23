import { textSpanIntersection } from "typescript";
import NewsApi, { RequestConfig } from "./newsapi";

// testing if the apikey is ever missing (undefined) i.e. the user hasn't created a .env file, it should return an error.
describe(`it should return '${NewsApi.Error.API_KEY_MISSING}'`, () => {
    it('when no API_KEY is provided / file hasn\'t been created', async() => {
        const requestConf : RequestConfig = {
            q: "technology",
            apiKey : undefined
        };
        const request = NewsApi.makeRequest(requestConf); 
        expect(request).rejects.toBe(NewsApi.Error.API_KEY_MISSING);
    })
})

describe(`it should return '${NewsApi.Error.INVALID_DATE_FORMAT}'`, () => {
    it('when an invalid date is provided through the a config property called "to" ', async() => {
        const requestConf : RequestConfig = {
            q: "technology",
            to: new Date("21/07/2021")
        }
        const request = NewsApi.makeRequest(requestConf);
        expect(request).rejects.toBe(NewsApi.Error.INVALID_DATE_FORMAT);
    });
});

test('it should accept the date if it\'s valid', () => {
    const requestConf : RequestConfig = {
        q: "technology",
        to: new Date("2021/07/21")
    }
    const request = NewsApi.makeRequest(requestConf);
    expect(request).resolves.toBeCalled();
})

// it should return out of bounds under these conditions
describe(`it should return '${NewsApi.Error.PAGE_SIZE_OUT_OF_BOUNDS}'`, () => {
    it('when the number is below 0', async() => {
        const requestConf : RequestConfig = {
            q: "technology",
            pageSize: -1
        };
        const request = NewsApi.makeRequest(requestConf);
        expect(request).rejects.toBe(NewsApi.Error.PAGE_SIZE_OUT_OF_BOUNDS);
    });
    it('when the number is higher than 100', async() => {
        const requestConf : RequestConfig = {
            q: "technology",
            pageSize : 101
        };
        const request = NewsApi.makeRequest(requestConf);
        expect(request).rejects.toBe(NewsApi.Error.PAGE_SIZE_OUT_OF_BOUNDS);
    });
    it(`it should return ${NewsApi.Error.PAGE_SIZE_UNDEFINED} when pageSize is never declared`, async() => {
        const requestConf : RequestConfig = {
            q: "technology",
            pageSize : undefined
        };
        const request = NewsApi.makeRequest(requestConf);
        expect(request).rejects.toBe(NewsApi.Error.PAGE_SIZE_UNDEFINED);
    });
});
