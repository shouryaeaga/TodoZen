<script>
    import {onMount} from 'svelte'
    import {page} from "$app/stores"
    import {browser} from "$app/environment"
    const token = $page.url.searchParams.get("token")
    const user_id = $page.url.searchParams.get("user_id")
    let message = ""
    let password1 = ""
    let password2 = ""
    let email = ""
    let password_box;
    let password_confirmation_box
    import apiUrl from '$lib/appConfig'

    let isLight

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
    })

    function passwordReset() {
        console.log("HELLO")
        if (password1 !== password2) {
            password_box.setAttribute('aria-invalid', 'true')
            password_confirmation_box.setAttribute('aria-invalid', 'true')
            message = "Passwords do not match"
        } else if (password1.length < 8 || password1.length > 24 || /\d/.test(password1) === false || /[a-zA-Z]/g.test(password1) === false || /\s/g.test(password1) === true){
            password_box.setAttribute('aria-invalid', 'true')
            message = "Password must contain letters, numbers and be longer than 8 characters and shorter than 24. Password can't contain spaces"
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
                message = "An error occured, please contact support@shouryaeaga.com"
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
            message = data.msg
        })
        .catch(error => {
            console.log(error) 
            message="An error occured, please contact support@shouryaeaga.com"
        })
    }

    function toggleTheme() {
        document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light')
        isLight = !isLight
        localStorage.setItem("isLight", String(isLight))
    }

    function toggleVisibility() {
        if (password_box.type === "password") {
            password_box.type = "text"
        } else {
            password_box.type = "password"
        }
    }

    function toggleVisibilityConfirm() {
        if (password_confirmation_box.type === "password") {
            password_confirmation_box.type = "text"
        } else {
            password_confirmation_box.type = "password"
        }
    }

</script>

<svelte:head>
    <meta name="description" content="Sort out and declutter your schedule into peace with TodoZen">
    <title>TodoZen - Forgot password</title>
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
    <article class="grid">
        <div>
            {#if !token}
            <hgroup>
                <h1>Enter your email and we will send a link to reset it</h1>
            </hgroup>
            
            <form on:submit={emailPasswordReset} target="frame" method="post">
                <input type="email" bind:value={email} name="email" id="email" placeholder="Enter your email">
                <input type="submit" value="Submit">
                <p id="message">{message}</p>
            </form>


            {:else}
            <hgroup>
                <h1>Enter your new password</h1>
            </hgroup>
            
            <form target="frame" method="post" on:submit={passwordReset}>
                <div class="container-fluid">
                    <div>
                        <input type="password" style="margin-right: 2%; width: 75%;" name="password1" id="password1" placeholder="Password" bind:value={password1} bind:this={password_box}>
                        <a role="button" href="#p" style="width: 20%;" on:click={toggleVisibility}><i class="fa-solid fa-eye"></i></a>
                    </div>
                </div>
                
                <div class="container-fluid">
                    <div>
                        <input type="password" style="margin-right: 2%; width: 75%;" name="password2" id="password2" placeholder="Confirm password" bind:value={password2} bind:this={password_confirmation_box}>
                        <a role="button" href="#p" style="width: 20%;" on:click={toggleVisibilityConfirm}><i class="fa-solid fa-eye"></i></a>
                    </div>
                </div>
                
                
                <input type="submit" value="Reset Password">
                <p id="message">{message}</p>
            </form>
            {/if}
        </div>
        
    </article>
</main>

<iframe name="frame" style="display: none;"></iframe>