export const CleanWebpage = {
        title: null, // title for the page, string
        internalMessage: null, // 
        showJSON: false, // shows the full JSON for the page (usualy on the bottom of the page), boolean
        pageMenu: null, // top level navigation
        breadCrumbs : null, // backward navigation, [{text: string, uri: string}]
        content: null // content, sum of anything
    };

export const breadCrumbs = {
    home: {text: "😃", uri : "/"},
    persons: {text: "люди", uri: "/p/"},
    concerts: {text: "концерты", uri: "/c/"},
    editor: {text: "редактор", uri: "/editor/"},
    editorPersons: {text: "персоны", uri: "/editor/persons/"},
    youtube: {text: "Youtube", uri: "/youtube/"}
};
