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
</script>

<div id="menu">
    <div id="content">
        <form>
            <input type="text" name="username" id="usernameInput" bind:value={username} placeholder="Username" required>
            <br>
            <input type="email" name="email" id="emailInput" bind:value={email} placeholder="Email" required>
            
            <br>
            
            <div id="password">
                <input type="password" name="password" id="passwordInput" placeholder="Password" bind:value={password} bind:this={password_box} required>
                <button on:click={toggleVisibility}>Show</button>
            </div>
            
            
            <br>
            
            <div id="password">
                <input type="password" name="password_confirm" id="passwordConfirmInput" placeholder="Confirmation" bind:value={password_confirmation} bind:this={password_confirmation_box} required>
                
                <button on:click={toggleVisibilityConfirm}>Show</button>
            </div>
            

            <input type="submit" id="submitButton" on:click={submitHandler} value="Register">

            <p id="message">
                {message}
            </p>
            <a href="/auth/login">Already registered? Login now</a>
        </form>
        
    </div>
</div>

<style>
    button {
        background-color: #e9e2e2;
        border-radius: 10px;
        border: 2px solid #e9e2e2;
        padding: 5px;
        margin: 5px;
        cursor: pointer;
    }

    #password {
        display: flex;
        position: relative; 
        width: 100%;
    }
    #menu {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);
        
    }

    #content {
        border: 1px solid #333;
        padding: 5px;
        box-shadow: 10px 10px 10px #888;
        border-radius: 10px;
        width: 250px;
    }

    #usernameInput, #passwordInput, #emailInput, #passwordConfirmInput {
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
    }
    a {
        text-decoration: none;
    }
</style>