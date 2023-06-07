<script>
    let username
    let email
    let password
    let password_box
    let password_confirmation
    let password_confirmation_box
    $: message = ""

    import apiUrl from '$lib/appConfig'

    import {browser} from '$app/environment'
    import {onMount} from 'svelte'
    import { page } from '$app/stores'

    let loading = true
    let error = false

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

    const api_url = apiUrl.apiUrl

    const submitHandler = (e) => {
        e.preventDefault();
        if (password !== password_confirmation) {
            message = "Passwords do not match"
        } else if (username.length > 20 || username.length < 3) {
            message = "Username should be between 3 and 20 characters"
        } else if (email.length > 255) {
            message = "Email cannot be over 255 characters"
        } else if (password.length < 8 || password.length > 24 || /\d/.test(password) === false || /[a-zA-Z]/g.test(password) === false){
            message = "Password must contain letters, numbers and be longer than 8 characters and shorter than 24"
        } else {
            fetch(`${api_url}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        })
        .then(res => {
            if (res.status == 500) {
                message = "Internal server error"
            }
            return res.json()
        })
        .then(data => {
            if (data.msg === "User created") {
                if (browser) {
                    window.location.href = "/auth/login?context=signup"
                }
                
            }
            message = data.msg
        })
        .catch((err) => console.log(err))
        }
        
    }

    const toggleVisibility = (e) => {
        if (password_box.type === "password") {
            password_box.type = "text"
        } else {
            password_box.type = "password"
        }
    }
    
    const toggleVisibilityConfirm = (e) => {
        if (password_confirmation_box.type === "password") {
            password_confirmation_box.type = "text"
        } else {
            password_confirmation_box.type = "password"
        }
    }

    function passwordChange() {
        if (password !== password_confirmation) {
            password_confirmation_box.setAttribute("aria-invalid", true)
        } else if (password.length < 8 || password.length > 24 || /\d/.test(password) === false || /[a-zA-Z]/g.test(password) === false) {
            password_box.setAttribute("aria-invalid", true)
            password_confirmation_box.setAttribute("aria-invalid", true)
        } else {
            password_box.setAttribute("aria-invalid", false)
            password_confirmation_box.setAttribute("aria-invalid", false)
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
    <article class="grid">
        <div>
            <form>
                <input type="text" name="username" id="usernameInput" bind:value={username} placeholder="Username" required>
                <br>
                <input type="email" name="email" id="emailInput" bind:value={email} placeholder="Email" required>
                
                <div class="container-fluid" id="password">
                    <div>
                        <div style="display: flex;">
                            <input type="password" style="margin-right: 5px;" name="password" id="passwordInput" on:change={passwordChange()} placeholder="Password" bind:value={password} bind:this={password_box} required>
                            <a role="button" href="#p" style="width: 62px; height: 62px;" on:click={toggleVisibility}><i class="fa-solid fa-eye"></i></a>
                        </div>
                        
                    </div>
                    
                    
                </div>
                
                <div class="container-fluid" id="password">
                    <div>
                        <div style="display: flex;">
                            <input type="password" style="margin-right: 5px;" name="password_confirm" id="passwordConfirmInput" on:change={passwordChange()} placeholder="Confirmation" bind:value={password_confirmation} bind:this={password_confirmation_box} required>
                            <a role="button" href="#p" style="width: 62px; height: 62px;" on:click={toggleVisibilityConfirm}><i class="fa-solid fa-eye"></i></a>
                        </div>
                    </div>
                </div>

                <div class="container">
                    <input type="submit" id="submitButton" on:click={submitHandler} value="Register">
                </div>
                
    
            </form>
            <p id="message">
                {message}
            </p>
            <div class="grid">
                <div><a role="button" on:click={() => {if (browser ) {window.location.href = "/auth/login"}}} href="/auth/login">Already registered? Login now</a></div>
            </div>
            
        </div>
    </article>
    {/if}
</main>


