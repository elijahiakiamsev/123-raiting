export async function createCleanWebpage() {
    const pageData = {
        title: null, // title for the page, string
        internalMessage: null, // 
        showJSON: false, // shows the full JSON for the page (usualy on the bottom of the page), boolean
        pageMenu: null, // top level navigation
        breadCrumbs : null, // backward navigation, [{text: string, uri: string}]
        content: null // content, sum of anything
    };
    return pageData;
};

export const breadCrumbs = {
    home: {text: "это смешно", uri : "/"},
};