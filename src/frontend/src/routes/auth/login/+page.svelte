<script>
    import { onMount } from 'svelte'
    import { page } from '$app/stores'
    import { browser } from '$app/environment'

    const context = $page.url.searchParams.get('context')
    
    let username;
    let password;
    let error = false
    $: message = ""
    import apiUrl from '$lib/appConfig'
    let password_box

    let loading = true
    const api_url = apiUrl.apiUrl

    onMount(() => {
        fetch(`${api_url}/auth/refresh`, {
            method: "POST",
            credentials: "include",
        })
        .then((response) => {
            if (response.status === 200) {
                if (browser) {
                    window.location.href = "/"
                }
            } else if (response.status === 401) {
                loading = false
            } else {
                loading = false
                error = true
            }
            return response.json()
        })
        .catch((err) => {
            console.log(err)
        })
    })

    const submitHandler = (e) => {
        e.preventDefault()

        fetch(`${api_url}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"

            },
            body: JSON.stringify({
                username: username,
                password: password
            }),
            credentials: "include"
        })
        .then((res) => {
            if (res.status === 500) {
                message = "Internal Server Error"
            }
            
            return res.json()
        })
        .then(data => {
            if (data.msg == "Login successful") {
                if (browser) {
                    window.location.href = '/'
                }
            } else {
                message = data.msg
            }
        })
        .catch((err) => console.log(err))
    }

    const toggleVisibility = (e) => {
        if (password_box.type === "password") {
            password_box.type = "text"
        } else {
            password_box.type = "password"
        }
    }
</script>

{#if loading}
    Loading...
{:else if error}
    There was an error, please contact support@shouryaeaga.com
{:else}
<br>

<div id="menu">
    <div id="content">
        
        <form>
            {#if context == "home"}
            You are unauthorized to view that page. Please login
            {/if}
            {#if context == "password-reset"}
            Your password has been reset. Please login
            {/if}
            {#if context == "signup"}
            Successfully created an account. Please login
            {/if}
            <input id="usernameInput" type="text" name="username" placeholder="Username" bind:value={username} required/>
            <br>
            <div id="password">
                <input type="password" name="password" id="passwordInput" placeholder="Password" bind:value={password} bind:this={password_box} required>
                <button on:click={toggleVisibility}>Show</button>
            </div>
            <br>
            <input id="submitButton" type="submit" value="Login" on:click={submitHandler}/>
            <p id="message">{message}</p>
            <div id="links">
                <a href="/auth/password-reset">Forgot password?</a>
                <br>
                <br>
                <a href="/auth/register">Register Now</a>
            </div>
            
        </form>
        
    </div>
    
</div>
{/if}


<style>
    #password {
        display: flex;
        position: relative; 
        width: 100%;
    }
    a {
        margin: 10px;
        text-align: center;
    }
    #menu {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);
    }

    #content {
        border: 1px solid #333;
        padding: 50px;
        box-shadow: 10px 10px 10px #888;
        border-radius: 10px;
        
    }

    #usernameInput, #passwordInput {
        background-color: #e9e2e2;
        padding: 10px;
        border-radius: 10px;
        width: 80%;
        margin: 10px;
        border: none;
    }

    #submitButton {
        background-color: #e9e2e2;
        border-radius: 10px;
        border: 2px solid #e9e2e2;
        padding: 10px;
        margin: 10px;
        cursor: pointer;
    }
    form {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
    }
    a {
        text-decoration: none;
    }
    #links {
        display: flex;
        justify-content: center;
        align-content: center;
    }

    button {
        background-color: #e9e2e2;
        border-radius: 10px;
        border: 2px solid #e9e2e2;
        padding: 5px;
        margin: 5px;
        cursor: pointer;
    }
</style>