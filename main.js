function getJSON(url) {
    var resp  = '';
    var xmlHttp = new XMLHttpRequest();

    if (xmlHttp != null) {
        xmlHttp.open("GET", url, false);
        xmlHttp.send(null);
        resp = xmlHttp.responseText;
    };

    return JSON.parse(resp);
};

function getDesc(repo) {
    var url = "https://raw.githubusercontent.com/" + repo + "/master/README.md";

    xmlHttp = new XMLHttpRequest();
    if (xmlHttp != null) {
        xmlHttp.open("GET", url, false);
        xmlHttp.send(null);
        var response = xmlHttp.responseText;
    };
    var converter = new showdown.Converter();
    var desc = converter.makeHtml(response);

    return desc;
};

function parseRepo(repo) {
    var result = {};
    result.location = repo.full_name;
    result.readme = getDesc(result.location);
    result.desc = repo.description;
    result.name = repo.name;
    result.url = repo.html_url;
    result.language = repo.language;
    if (repo.homepage != "") {
        result.website = repo.homepage;
    } else {
        result.website = false;
    };
    return result;
};

function createElement(elem, text, id, className, href) {
    var element = document.createElement(elem);
    element.innerHTML = text;
    id = id || "";
    className = className || "";
    href = href || "";
    element.setAttribute("id", id);
    element.setAttribute("class", className);
    element.setAttribute("href", href);
    return element;
};

function createItem(item) {
    var main = createElement("li", "");
    var div = createElement("div", "");
    if (item.website) {var website = item.website} else {var website = item.url};
    var link = createElement("a", "", "", "item", website);
    link.setAttribute("target", "_blank");
    var titlespan = createElement("span", item.name, "", "desc");
    var descspan = createElement("span", item.desc, "", "desc");
    var readmespan = createElement("span", item.readme, "", "desc");
    link.appendChild(titlespan);
    link.appendChild(descspan);
    link.appendChild(readmespan);
    div.appendChild(link);
    main.appendChild(div);
    return main;
};

function getOrgs(user) {
    var orgs = getJSON("https://api.github.com/users/" + user + "/orgs");
    var result = []
    for (var org in orgs) {
        result.push(orgs[org].repos_url);
    };
    return result;
};

function parseGHResult(ghresult) {
    var repos = {};
    for (var item in ghresult) {
        repos[item] = parseRepo(ghresult[item]);
    }
    return repos;
};

function getRepos(user) {
    var repos = parseGHResult(getJSON("https://api.github.com/users/" + user + "/repos"));
    var orgs = getOrgs(user);
    var orgRepos = {};
    for (var org in orgs) {
        orgRepos[org] = parseGHResult(getJSON(orgs[org]));
    };
    var size = Object.keys(orgRepos).length;
    var result = orgRepos;
    result[size] = repos;
    return result;
};

function main(user) {
    var repos = getRepos(user);
    var target = document.getElementsByTagName("ul")[0];
    for (var key in repos) {
        for (var item in repos[key]) {
            target.appendChild(createItem(repos[key][item]));
        };
    };
};

main("MWPuppire");