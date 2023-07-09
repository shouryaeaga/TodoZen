<script>
    import {onMount} from 'svelte'
    import apiUrl from "./appConfig"
    const api_url = apiUrl.apiUrl

    import {browser} from '$app/environment'

    let usernameInput
    let changeUsernameMessage = ""

    let oldPassword
    let passwordInput
    let passwordInput2
    let changePasswordMessage = ""

    let changeEmailMessage = ""
    let emailInput

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

    let isLight

    export let toggle_theme
    
    let page = "account"

    function accountPage() {
        page = "account"
    }

    function themePage() {
        page = "theme"
    }

    function changeUsername() {
        fetch(`${api_url}/auth/change-username`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({username: usernameInput})
        })
        .then((res) => res.json())
        .then((data) => {
            changeUsernameMessage = data.msg
            if (browser) {
                window.location.href = "/"
            }
        })
    }

    function changePassword() {
        if (passwordInput !== passwordInput2) {
            changePasswordMessage = "Passwords do not match"
        } else if (passwordInput.length < 8 || passwordInput.length > 24 || /\d/.test(passwordInput) === false || /[a-zA-Z]/g.test(passwordInput) === false || /\s/g.test(passwordInput) === true){
            changePasswordMessage = "Password must contain letters, numbers and be longer than 8 characters and shorter than 24"
        } else {
            fetch(`${api_url}/auth/change-password`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({old_password: oldPassword, new_password: passwordInput})
            })
            .then((res) => res.json())
            .then((data) => {
                changePasswordMessage = data.msg
            })
        }
    }

    function changeEmail() {
        fetch(`${api_url}/auth/change-email`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({email: emailInput})
        })
        .then((res) => res.json())
        .then((data) => {
            changeEmailMessage = data.msg
            if (browser) {
                window.location.href = "/"
            }
        })
    }

</script>

<article>
    <header>
        <h2>Settings</h2>
        {#if page === "account"}
        <h4>Account</h4>
        {:else}
        <h4>Theme</h4>
        {/if}
    </header>
    <div class="container">
        
        <h2>Change username</h2>
        <form on:submit={changeUsername}>
            <input type="text" bind:value={usernameInput} name="Username" id="username" placeholder="Change Username">
            <input type="submit" value="Change">
        </form>
        <p>{changeUsernameMessage}</p>
        <hr>
        <h2>Change Password</h2>
        <form on:submit={changePassword}>
            <input type="password" bind:value={oldPassword} name="oldPassword" id="oldPassword" placeholder="Enter old password">
            <input type="password" bind:value={passwordInput} name="Password1" id="password1" placeholder="Enter password">
            <input type="password" bind:value={passwordInput2} name="Password2" id="password2" placeholder="Confirm password">
            <input type="submit" value="Change">
        </form>
        <p>{changePasswordMessage}</p>
        <hr>
        <h2>Change email</h2>
        <form on:submit={changeEmail}>
            <input type="email" bind:value={emailInput} name="Email" id="email" placeholder="Change Email">
            <input type="submit" value="Change">
        </form>
        <p>{changeEmailMessage}</p>
    </div>
    
</article>