////Get the form element by id
//const sampleForm = document.getElementById("test");
////Add an event listener to the form element and handler for the submit an event.
//sampleForm.addEventListener("click", async (e) => {
//    e.preventDefault();
//    let responseData = await postFormFieldsAsJson();
//    console.log(responseData);
//});
//
//async function postFormFieldsAsJson() {
//    var loginName = "test";
//    var projectName = "CoolProjectName";
//
//    let fetchOptions = {
//        method: "POST",
//        headers: {
//            "Content-Type": "application/json",
//            Accept: "application/json",
//        },
//        body: JSON.stringify({ username: loginName, projectName: projectName }),
//    };
//
//    let res = await fetch(API_URL + "/projects", fetchOptions);
//
//    if (!res.ok) {
//        let error = await res.text();
//        throw new Error(error);
//    }
//
//    return res.json();
//}

function convertProjectType(type) {
    switch (type) {
        case "sea":
            return "Subsea";
        case "grass":
            return "Grassland";
    }
    return "Unknown (" + type + ")";
}

function addProject(project, index) {
    // Add project to the carousel
    let html = `<div class="carousel-item ${index === 0 ? "active" : ""} data-bs-interval="90000">
        <div class="carousel-caption d-none d-md-block">
            <h3>${project.name}</h3>
            <p>${convertProjectType(project.type)}</p>
            <a href="/app.html?id=${project.id}" class="btn btn-success btn-sm">Open Project</a>
        </div>
    </div>`;

    //
    document.getElementById("projects").innerHTML += html;

    // Add indicator
    document.getElementById("project-indicators").innerHTML += `<button type="button" ${index === 0 ? `class="active" aria-current="true"` : ""} data-bs-target="#carousel-item" data-bs-slide-to="${index}" aria-label="${project.name}"></button>`;
}

async function onPageLoad() {
    let response = await getProjects(getCookie("loginCookie"));
    console.log(response);

    for (let i = 0; i < response.projects.length; i++) {
        addProject(response.projects[i], i);
    }
}
