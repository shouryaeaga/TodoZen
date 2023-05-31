<script>
    import {onMount} from 'svelte'
    import {browser} from '$app/environment'
    import Todo from '$lib/Todo.svelte'

    import apiUrl from '$lib/appConfig'
    const api_url = apiUrl.apiUrl

    let todos = []

    let loading = true

    let todoDetail = ""

    let user = {};
    let username = ""
    function refresh() {
        return fetch(`${api_url}/auth/refresh`, {
            method: "POST",
            credentials: "include",
        })
        .then((response) => {
            if (response.status === 401) {
                if (browser) {
                    window.location.href = "/auth/login?context=home"
                }
            } else {
                loading = false
            }
            return response.json()
        })
        .then((data) => {
            user = data.user;
            username = (user.username).charAt(0).toUpperCase() + (user.username).slice(1)
        })
        .catch((err) => {
            console.log(err)
        })
    }

    function getTodos() {
        return fetch(`${api_url}/todo/me`, {
            method: "GET",
            credentials: "include",
        })
       .then((response) => response.json())
       .then((data) => {
        todos = data
 
    })}

    function addTodo(e) {
        e.preventDefault()
        if (todoDetail.length > 512) {
            alert("Todo cannot be longer than 512 characters")
        } else{
            fetch(`${api_url}/todo/me`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    details: todoDetail,
                }),
            })
            .then((response) => response.json())
            .then((data) => {
                todos = [...todos, data]
            })
            .catch((err) => console.log(err))
        }
        
    }

    function logout() {
        if (confirm("Are you sure you want to logout?")) {
            fetch(`${api_url}/auth/logout`, {
                method: "POST",
                credentials: "include",
            })
            .then((response) => response.json())
            .then((data) => {
                if (browser) {
                    window.location.href = "/auth/login"
                }
            })
            .catch((err) => console.log(err))
        }
        
    }

    function toggleAccountPopup() {
        if (document.getElementById("account-popup").style.display === "none") {
            document.getElementById("account-popup").style.display = "block"
        } else if (document.getElementById("account-popup").style.display === "") {
            document.getElementById("account-popup").style.display = "block"
        } else {
            document.getElementById("account-popup").style.display = "none"
        }
    }

    function deleteHandler(index) {
        todos.splice(index, 1)
        fetch(`${api_url}/todo/me`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify({"id": id})
        })
        .then(response => response.json())
        .then(data => {
            if (browser) {
                window.location.href = "/"
            }
        })
    }

    onMount(async () => {
        await refresh()
        const refreshInterval = setInterval(refresh, 870000)

        getTodos()
        return () => {
            clearInterval(refreshInterval)
        }
    })
</script>

{#if loading}
loading...
{:else}

<nav>
    <button on:click={toggleAccountPopup} id="togglePopupButton">{username}</button>

    <div id="account-popup" style="none">
        <h1>Account</h1>
        <p>Username: {user.username}</p>
        <p>Email: {user.email}</p>
        <button on:click={logout} id="logout-button">Logout</button>
    </div>
    
</nav>


<br>

<div id="createForm">
    
    <form on:submit={addTodo}>
        <input type="text" name="detailsInput" id="detailsInput" bind:value={todoDetail} placeholder="Make coffee" required>
        
        <input type="submit" value="Add Task" id="formSubmit">
    </form>
</div>


{#if todos.length > 0}
<div id="todos">
    {#each todos as Todo (todo.id)}
        <Todo  completed={todo.completed} details={todo.details} id={todo.id} />
        <br>
    {/each}
</div>
{:else}
<p>No todos yet</p>
{/if}
{/if}

<style>

    #logout-button {
        background-color: #c7bebe;
    }

    #account-popup {
        background-color: #e9e2e2;
        display: none;
        margin: 0;
        position: absolute;
        z-index: 2;
        padding: 10px;
        border-radius: 5%;
        border: solid 1px #333;
    }

    #formSubmit, button {
        background-color: #e9e2e2;
        border-radius: 10px;
        border: 2px solid #e9e2e2;
        padding: 10px;
        margin: 10px;
        cursor: pointer;
    }

    #formSubmit:hover, button:hover {
        border: 2px solid #333;
    }

    #todos {
        margin: auto;
        width: 100%;

    }

    /* Centre horizontally */
    #createForm {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    #detailsInput {
        border-radius: 10px;
        border: none;
        padding: 15px;
        font-size: 1rem;
        display: block;
        width: 75%;
        margin: 10px;
        background-color: #e9e2e2;
        font-weight: 200;
    }
    form {
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }
</style>