<script>
    import {page} from "$app/stores"
    import {browser} from "$app/environment"
    const token = $page.url.searchParams.get("token")
    const user_id = $page.url.searchParams.get("user_id")
    let message = ""
    let password1 = ""
    let password2 = ""
    let email = ""
    import apiUrl from '$lib/appConfig'

    const api_url = apiUrl.apiUrl

    function passwordReset() {
        if (password1!== password2) {
            message = "Passwords do not match"
        } else {
            fetch(`${api_url}/auth/forgot-password/${user_id}/${token}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    password: password1
                })
            })
            .then((res) => {
                if (res.status === 200) {
                    if (browser) {
                        window.location.href = "/auth/login?context=password-reset"
                    }
                }
                return res.json()
            })
            .then((data) => {
                message = data.msg
                
            })
            .catch((err) => {
                message = "An error occured"
                console.log(err)
            })
        }
        
    }

    function emailPasswordReset() {
        fetch(`${api_url}/auth/forgot-password/`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data)
            message = data.msg
        })
        .catch(error => {
            console.log(error) 
            message="An error occured"
        })
    }

</script>
<div id="menu">
    <div id="content">
        {#if !token}

        <h3>Enter your email and we will send a link to reset it</h3>
        <form on:submit={emailPasswordReset}>
            <input type="email" bind:value={email} name="email" id="email" placeholder="Enter your email">
            <input type="submit" value="Submit">
            <p id="message">{message}</p>
        </form>


        {:else}
        <h3>Enter your new password</h3>
        <form on:submit={passwordReset}>
            <input type="password" name="password1" id="password1" placeholder="Password" bind:value={password1}>
            <input type="password" name="password2" id="password2" placeholder="Confirm password" bind:value={password2}>
            <input type="submit" value="Set password">
            <p id="message">{message}</p>
        </form>
        {/if}
    </div>
</div>

<style>
    #menu {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);
    }
    h3 {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    #content {
        border: 1px solid #333;
        padding: 100px;
        box-shadow: 10px 10px 10px #888;
        border-radius: 10px;
        text-align: center;
    }

    #email, #password1, #password2 {
        background-color: #e9e2e2;
        padding: 10px;
        border-radius: 10px;
        width: 80%;
        margin: 10px;
        border: none;
    }

    input[type=submit] {
        background-color: #e9e2e2;
        border-radius: 10px;
        border: 2px solid #e9e2e2;
        padding: 10px;
        margin: 10px;
        cursor: pointer;
    }
</style>
