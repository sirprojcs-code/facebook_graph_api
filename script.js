function fbSelect(id) {
    return document.getElementById(id);
}

function fbGetTrimmedValue(input) {
    if (!input) {
        return "";
    }
    return input.value.trim();
}

function fbIsSafeText(text) {
    if (!text) {
        return true;
    }
    if (text.indexOf("<") !== -1 || text.indexOf(">") !== -1) {
        return false;
    }
    return true;
}

function fbBuildPageUrl(pageId, accessToken, fields) {
    var baseUrl = fbApiBaseUrl + "/" + encodeURIComponent(pageId);
    var params = [];
    if (fields) {
        params.push("fields=" + encodeURIComponent(fields));
    }
    params.push("access_token=" + encodeURIComponent(accessToken));
    return baseUrl + "?" + params.join("&");
}

function fbBuildPostsUrl(pageId, accessToken, limit) {
    var baseUrl = fbApiBaseUrl + "/" + encodeURIComponent(pageId) + "/posts";
    var params = [];
    params.push("fields=id,message,created_time,likes.summary(true),comments.summary(true)");
    params.push("limit=" + (limit || 10));
    params.push("access_token=" + encodeURIComponent(accessToken));
    return baseUrl + "?" + params.join("&");
}

// yung function nato is ginagawa nya lang is binubuo nya yung url ng na gagamitin pang fetch ng data
function fbBuildUserUrl(userId, accessToken, fields) {
    var baseUrl = fbApiBaseUrl + "/" + encodeURIComponent(userId);
    var params = [];
    if (fields) {
        params.push("fields=" + encodeURIComponent(fields));
    }
    params.push("access_token=" + encodeURIComponent(accessToken));
    return baseUrl + "?" + params.join("&");
}

function fbSetButtonLoading(isLoading) {
    var button = fbSelect("fb-fetch-button");
    if (!button) {
        return;
    }
    var spinner = button.querySelector(".fb-button-spinner");
    if (isLoading) {
        button.disabled = true;
        button.classList.add("fb-button-loading");
        if (spinner) {
            spinner.style.display = "inline-block";
        }
    } else {
        button.disabled = false;
        button.classList.remove("fb-button-loading");
        if (spinner) {
            spinner.style.display = "none";
        }
    }
}

function fbSetLoadingVisible(isVisible) {
    var loading = fbSelect("fb-loading-message");
    if (!loading) {
        return;
    }
    if (isVisible) {
        loading.classList.add("fb-loading-visible");
    } else {
        loading.classList.remove("fb-loading-visible");
    }
}

function fbShowError(message) {
    var container = fbSelect("fb-error-container");
    if (!container) {
        return;
    }
    container.textContent = message || "";
}

function fbClearError() {
    fbShowError("");
}

function fbCreateElement(tag, className, text) {
    var el = document.createElement(tag);
    if (className) {
        el.className = className;
    }
    if (text) {
        el.textContent = text;
    }
    return el;
}

function fbRenderEmptyState(message) {
    var container = fbSelect("fb-results-container");
    if (!container) {
        return;
    }
    container.innerHTML = "";
    var text = message || "No data found. Enter an access token and page ID, then fetch data.";
    var div = fbCreateElement("div", "fb-empty-state", text);
    container.appendChild(div);
}

function fbFormatDate(dateString) {
    if (!dateString) {
        return "Date not available";
    }
    var date = new Date(dateString);
    var options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return date.toLocaleDateString(undefined, options);
}

function fbRenderPageInfo(data) {
    var container = fbSelect("fb-results-container");
    if (!container) {
        return;
    }
    container.innerHTML = "";
    var card = fbCreateElement("div", "fb-data-card");
    var title = fbCreateElement("h2", "fb-data-title", data.name || "Page Information");
    card.appendChild(title);
    if (data.id) {
        var idLabel = fbCreateElement("div", "fb-data-label", "Page ID");
        var idValue = fbCreateElement("div", "fb-data-value", data.id);
        card.appendChild(idLabel);
        card.appendChild(idValue);
    }
    if (data.about) {
        var aboutLabel = fbCreateElement("div", "fb-data-label", "About");
        var aboutValue = fbCreateElement("div", "fb-data-value", data.about);
        card.appendChild(aboutLabel);
        card.appendChild(aboutValue);
    }
    if (data.category) {
        var catLabel = fbCreateElement("div", "fb-data-label", "Category");
        var catValue = fbCreateElement("div", "fb-data-value", data.category);
        card.appendChild(catLabel);
        card.appendChild(catValue);
    }
    if (data.followers_count !== undefined) {
        var followersLabel = fbCreateElement("div", "fb-data-label", "Followers");
        var followersValue = fbCreateElement("div", "fb-data-value", data.followers_count.toLocaleString());
        card.appendChild(followersLabel);
        card.appendChild(followersValue);
    }
    if (data.picture && data.picture.data && data.picture.data.url) {
        var imgLabel = fbCreateElement("div", "fb-data-label", "Profile Picture");
        var img = document.createElement("img");
        img.src = data.picture.data.url;
        img.className = "fb-data-image";
        img.alt = "Page profile picture";
        card.appendChild(imgLabel);
        card.appendChild(img);
    }
    if (data.cover && data.cover.source) {
        var coverLabel = fbCreateElement("div", "fb-data-label", "Cover Photo");
        var coverImg = document.createElement("img");
        coverImg.src = data.cover.source;
        coverImg.className = "fb-data-image";
        coverImg.alt = "Page cover photo";
        card.appendChild(coverLabel);
        card.appendChild(coverImg);
    }
    container.appendChild(card);
}

function fbRenderPosts(data) {
    var container = fbSelect("fb-results-container");
    if (!container) {
        return;
    }
    container.innerHTML = "";
    if (!data || !data.data || data.data.length === 0) {
        fbRenderEmptyState("No posts found for this page.");
        return;
    }
    for (var i = 0; i < data.data.length; i++) {
        var post = data.data[i];
        var card = fbCreateElement("article", "fb-post-card");
        if (post.message) {
            var message = fbCreateElement("div", "fb-post-message", post.message);
            card.appendChild(message);
        }
        if (post.created_time) {
            var date = fbCreateElement("div", "fb-post-date", fbFormatDate(post.created_time));
            card.appendChild(date);
        }
        var stats = fbCreateElement("div", "fb-post-stats");
        if (post.likes && post.likes.summary) {
            var likesCount = post.likes.summary.total_count || 0;
            var likesText = fbCreateElement("span", "", likesCount + " likes");
            stats.appendChild(likesText);
        }
        if (post.comments && post.comments.summary) {
            var commentsCount = post.comments.summary.total_count || 0;
            var commentsText = fbCreateElement("span", "", commentsCount + " comments");
            stats.appendChild(commentsText);
        }
        if (stats.children.length > 0) {
            card.appendChild(stats);
        }
        container.appendChild(card);
    }
}

// ginagawa nmn ng function nato is pag nakuha na yung data or nafetch na ng api natin ididisplay nya na sa mga containerts natin na ginawa sa html file
function fbRenderUserInfo(data) {
    var container = fbSelect("fb-results-container");
    if (!container) {
        return;
    }
    container.innerHTML = "";
    var card = fbCreateElement("div", "fb-data-card");
    var title = fbCreateElement("h2", "fb-data-title", data.name || "My Profile");
    card.appendChild(title);
    if (data.picture && data.picture.data && data.picture.data.url) {
        var img = document.createElement("img");
        img.src = data.picture.data.url;
        img.className = "fb-data-image";
        img.alt = "Profile picture";
        img.style.marginBottom = "12px";
        card.appendChild(img);
    }
    if (data.id) {
        var idLabel = fbCreateElement("div", "fb-data-label", "User ID");
        var idValue = fbCreateElement("div", "fb-data-value", data.id);
        card.appendChild(idLabel);
        card.appendChild(idValue);
    }
    if (data.name) {
        var nameLabel = fbCreateElement("div", "fb-data-label", "Name");
        var nameValue = fbCreateElement("div", "fb-data-value", data.name);
        card.appendChild(nameLabel);
        card.appendChild(nameValue);
    }
    if (data.email) {
        var emailLabel = fbCreateElement("div", "fb-data-label", "Email");
        var emailValue = fbCreateElement("div", "fb-data-value", data.email);
        card.appendChild(emailLabel);
        card.appendChild(emailValue);
    }
    if (data.first_name) {
        var firstNameLabel = fbCreateElement("div", "fb-data-label", "First Name");
        var firstNameValue = fbCreateElement("div", "fb-data-value", data.first_name);
        card.appendChild(firstNameLabel);
        card.appendChild(firstNameValue);
    }
    if (data.last_name) {
        var lastNameLabel = fbCreateElement("div", "fb-data-label", "Last Name");
        var lastNameValue = fbCreateElement("div", "fb-data-value", data.last_name);
        card.appendChild(lastNameLabel);
        card.appendChild(lastNameValue);
    }
    if (data.birthday) {
        var birthdayLabel = fbCreateElement("div", "fb-data-label", "Birthday");
        var birthdayValue = fbCreateElement("div", "fb-data-value", data.birthday);
        card.appendChild(birthdayLabel);
        card.appendChild(birthdayValue);
    }
    if (data.location && data.location.name) {
        var locationLabel = fbCreateElement("div", "fb-data-label", "Location");
        var locationValue = fbCreateElement("div", "fb-data-value", data.location.name);
        card.appendChild(locationLabel);
        card.appendChild(locationValue);
    }
    if (data.link) {
        var linkLabel = fbCreateElement("div", "fb-data-label", "Profile Link");
        var linkValue = document.createElement("a");
        linkValue.href = data.link;
        linkValue.textContent = data.link;
        linkValue.target = "_blank";
        linkValue.className = "fb-data-value";
        linkValue.style.color = "#2563eb";
        linkValue.style.textDecoration = "underline";
        card.appendChild(linkLabel);
        card.appendChild(linkValue);
    }
    container.appendChild(card);
}

// dito naman is yung pag validate ng access token, pag wala laman lalabas yung enter access token
function fbValidateAccessToken(accessToken) {
    if (!accessToken) {
        return "enter access token";
    }
    if (!fbIsSafeText(accessToken)) {
        return "invalid token";
    }
    return "";
}

async function fbFetchPageInfo(pageId, accessToken) {
    var fields = "id,name,about,category,followers_count,picture,cover";
    var url = fbBuildPageUrl(pageId, accessToken, fields);
    try {
        var response = await fetch(url);
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                return { error: "invalid token" };
            }
            if (response.status === 404) {
                return { error: "not found" };
            }
            if (response.status === 429) {
                return { error: "too many requests" };
            }
            var errorData = await response.json();
            var errorMsg = errorData.error ? errorData.error.message : "request failed";
            return { error: errorMsg };
        }
        var data = await response.json();
        return { data: data };
    } catch (e) {
        return { error: "connection error" };
    }
}

async function fbFetchPosts(pageId, accessToken) {
    var url = fbBuildPostsUrl(pageId, accessToken, 10);
    try {
        var response = await fetch(url);
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                return { error: "invalid token" };
            }
            if (response.status === 404) {
                return { error: "not found" };
            }
            if (response.status === 429) {
                return { error: "too many requests" };
            }
            var errorData = await response.json();
            var errorMsg = errorData.error ? errorData.error.message : "request failed";
            return { error: errorMsg };
        }
        var data = await response.json();
        return { data: data };
    } catch (e) {
        return { error: "connection error" };
    }
}

// yung function naman nato is yung pag fetch ng mismong data as facebook
async function fbFetchMyProfile(accessToken) {
    var fields = "id,name,first_name,last_name,email,picture,birthday,location,link";
    var url = fbBuildUserUrl("me", accessToken, fields);
    try {
        var response = await fetch(url);
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                return { error: "invalid token" };
            }
            if (response.status === 404) {
                return { error: "not found" };
            }
            if (response.status === 429) {
                return { error: "too many requests" };
            }
            var errorData = await response.json();
            var errorMsg = errorData.error ? errorData.error.message : "request failed";
            return { error: errorMsg };
        }
        var data = await response.json();
        return { data: data };
    } catch (e) {
        return { error: "connection error" };
    }
}

// dito naman yung functionality ng button natin if clinick natin yung button matitrigger tong function nato
async function fbFetchData() {
    var accessTokenInput = fbSelect("fb-access-token");
    var accessToken = fbGetTrimmedValue(accessTokenInput);
    var error = fbValidateAccessToken(accessToken);
    if (error) {
        fbRenderEmptyState("");
        fbShowError(error);
        return;
    }
    fbClearError();
    fbSetButtonLoading(true);
    fbSetLoadingVisible(true);
    var result = await fbFetchMyProfile(accessToken);
    if (result.error) {
        fbRenderEmptyState("");
        fbShowError(result.error);
    } else {
        fbRenderUserInfo(result.data);
        fbShowError("");
    }
    fbSetButtonLoading(false);
    fbSetLoadingVisible(false);
}


function fbAttachEvents() {
    var button = fbSelect("fb-fetch-button");
    if (button) {
        button.addEventListener("click", function () {
            fbFetchData();
        });
    }
    var accessTokenInput = fbSelect("fb-access-token");
    if (accessTokenInput) {
        accessTokenInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                fbFetchData();
            }
        });
    }
}

// ito yung function na mag loload sawebsite para ok lahat walang magiging error
function fbInit() {
    fbRenderEmptyState("enter your fb access token and click");
    fbAttachEvents();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
        fbInit();
    });
} else {
    fbInit();
}
