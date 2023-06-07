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

<nav class="container-fluid">
    <ul>
        <li>Todo</li>
    </ul>
</nav>

<main class="container">
    {#if loading}
    Loading...
    {:else if error}
        There was an error, please contact support@shouryaeaga.com
    {:else}
    <article id="content">
        <div>
            <form>
                <hgroup>
                    <h1>Login</h1>
                    {#if context == "home"}
                    <h2>You are unauthorized to view that page. Please login</h2>
                    {/if}
                    {#if context == "password-reset"}
                    <h2>
                    Your password has been reset. Please login
                    </h2>
    
                    {/if}
                    {#if context == "signup"}
                    <h2>Successfully created an account. Please login</h2>
                    
                    {/if}
                </hgroup>
    
                
                <input id="usernameInput" type="text" aria-label="Username" name="username" placeholder="Username" bind:value={username} required/>
                <div class="container">
                    <div>
                        <div style="display: flex;">
                            <input type="password" style="margin-right: 5px;" name="password" aria-label="Password" id="passwordInput" placeholder="Password" bind:value={password} bind:this={password_box} required>
                            <a role="button" href="#p" style="width: 62px; height: 62px;" on:click={toggleVisibility}><i class="fa-solid fa-eye"></i></a>
                        </div>
                        
                    </div>
                    
                </div>
                <input id="submitButton" type="submit" value="Login" on:click={submitHandler}/>
                <p id="message">{message}</p>
                <div class="grid">
                    <div><a role="button" href="/auth/password-reset">Forgot password?</a></div>
                    <div><a role="button" href="/auth/register">Register Now</a></div>
                    
                </div>
                
            </form>
        </div>
        
        
    </article>
    {/if}
</main>

