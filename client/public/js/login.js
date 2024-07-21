//Get the form element by id
const sampleForm = document.getElementById("loginButton");

//Add an event listener to the form element and handler for the submit an event.
sampleForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    let responseData = await postFormFieldsAsJson();

    if (responseData.successful) {
        setCookie("loginCookie", responseData.token);
        console.log(responseData);
        window.location.pathname = '/';
    } else {
        document.getElementById("unsuccessfulLogin").innerHTML = "Please check your credentials";
    }

});

async function postFormFieldsAsJson() {
    let loginName = document.getElementById("emailInput").value;
    let password = document.getElementById("passwordInput").value;
    return await login(loginName, password);
}

async function getFormFieldsAsJson() {

    let fetchOptions = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            'Authorization': 'Bearer ' + token
        },
    };

    let res = await fetch(API_URL + "/", fetchOptions);

    if (!res.ok) {
        let error = await res.text();
        throw new Error(error);
    }

    return res.json();
}