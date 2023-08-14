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

    let isLight

    let loading = true
    const api_url = apiUrl.apiUrl

    onMount(() => {

        isLight = (localStorage.getItem("isLight") === "true")
        if (isLight === true) {
            document.documentElement.setAttribute('data-theme', 'light')
        } else if (isLight === false) {
            document.documentElement.setAttribute('data-theme', 'dark')
        } else {
            document.documentElement.setAttribute('data-theme', 'auto')
        }

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

    function toggleTheme() {
        document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light')
        isLight = !isLight
        localStorage.setItem("isLight", String(isLight))
    }

</script>

<svelte:head>
    <meta name="description" content="Sort out and declutter your schedule into peace with TodoZen">
    <title>TodoZen - Login</title>
</svelte:head>

<nav class="container-fluid">
    <ul>
        <li><a data-placement="bottom" data-tooltip="Back home" aria-label="Back home" class="contrast" href="/">TodoZen</a></li>
    </ul>
    <ul>
        <li><a role="button" href="#toggle" class="contrast theme-switcher" on:click={toggleTheme}>Toggle theme</a></li>
      
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
            <form method="post">
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
    
                <div class="container-fluid">
                    <div>
                        <input id="usernameInput" style="width: 97%;" type="text" aria-label="Username" name="username" placeholder="Username" bind:value={username} required/>
                    </div>
                </div>
                
                
                <div class="container-fluid">
                    <div>
                        <input type="password" style="margin-right: 2%; width: 75%;" name="password" aria-label="Password" id="passwordInput" placeholder="Password" bind:value={password} bind:this={password_box} required>
                        <a role="button" href="#p" style="width: 20%;" on:click={toggleVisibility}><i class="fa-solid fa-eye"></i></a>
                    </div>
                    
                </div>
                <input id="submitButton" type="submit" value="Login" on:click={submitHandler}/>
                <p id="message">{message}</p>
                <div class="container-fluid">
                    <div>
                        <a style="width: 48%; margin-right: 2%;" role="button" href="/auth/password-reset">Forgot password?</a> 
                        <a style="width: 48%;" role="button" href="/auth/register">Register Now</a>
                    </div>
                    
                </div>
                
            </form>
        </div>
        
        
    </article>
    {/if}
</main>

