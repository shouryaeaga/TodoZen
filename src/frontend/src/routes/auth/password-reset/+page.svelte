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

    function passwordReset(e) {
        e.preventDefault()

        if (password1!== password2) {
            message = "Passwords do not match"
        } else if (password.length < 8 || password.length > 24 || /\d/.test(password) === false || /[a-zA-Z]/g.test(password) === false || /\s/g.test(password) === true){
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

    function passwordChange() {
        if (password1 !== password2) {
            password_confirmation_box.setAttribute("aria-invalid", true)
        } else if (password1.length < 8 || password1.length > 24 || /\d/.test(password1) === false || /[a-zA-Z]/g.test(password1) === false) {
            password_box.setAttribute("aria-invalid", true)
            password_confirmation_box.setAttribute("aria-invalid", true)
        } else {
            password_box.setAttribute("aria-invalid", false)
            password_confirmation_box.setAttribute("aria-invalid", false)
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
    <title>TodoZen - Forgot password</title>
</svelte:head>

<nav class="container-fluid">
    <ul>
        <li>TodoZen</li>
    </ul>
    <ul>
        <li><a role="button" href="#toggle" class="contrast theme-switcher" on:click={toggleTheme}>Toggle theme</a></li>
        <li>
            
            <a href="/">Home</a>

        </li>
    </ul>
</nav>

<main class="container">
    <article class="grid">
        <div>
            {#if !token}
            <hgroup>
                <h1>Enter your email and we will send a link to reset it</h1>
            </hgroup>
            
            <form on:submit={emailPasswordReset}>
                <input type="email" bind:value={email} name="email" id="email" placeholder="Enter your email">
                <input type="submit" value="Submit">
                <p id="message">{message}</p>
            </form>


            {:else}
            <hgroup>
                <h1>Enter your new password</h1>
            </hgroup>
            
            <form>
                <input type="password" name="password1" id="password1" placeholder="Password" on:change={passwordChange()} bind:value={password1} bind:this={password_box}>
                <input type="password" name="password2" id="password2" placeholder="Confirm password" on:change={passwordChange()} bind:value={password2} bind:this={password_confirmation_box}>
                <input type="submit" value="Set password" on:click={passwordReset}>
                <p id="message">{message}</p>
            </form>
            {/if}
        </div>
        
    </article>
</main>
