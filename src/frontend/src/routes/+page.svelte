<script>
    import {onMount} from 'svelte'
    import {browser} from '$app/environment'
    import Todo from '$lib/Todo.svelte'

    import apiUrl from '$lib/appConfig'
    const api_url = apiUrl.apiUrl

    let account_popup;

    let todos = []

    let loading = true

    let anonymous = false

    let todoDetail = ""

    let toggle_account_popup

    let user = {};
    let username = ""
    function refresh(todoReq) {
        fetch(`${api_url}/auth/refresh`, {
            method: "POST",
            credentials: "include",
        })
        .then((response) => {
            if (response.status === 401) {
                anonymous = true
                todoReq()
            }
            todoReq()
            return response.json()
        })
        .then((data) => {
            if (data.user) {
                user = data.user;
                username = (user.username).charAt(0).toUpperCase() + (user.username).slice(1)
            }
        })
    }

    function getTodos() {
        if (anonymous === false) {
            fetch(`${api_url}/todo/me`, {
                method: "GET",
                credentials: "include",
            })
            .then((response) => response.json())
            .then((data) => {
                todos = data
                loading = false
            })
        } else {
            todos = JSON.parse(localStorage.getItem("todos"))
            if (todos == null || todos.length == 0) {
                todos = []
            }

            loading = false
        }
    }

    function addTodo(e) {
        e.preventDefault()
        if (todoDetail.length > 512) {
            alert("Todo cannot be longer than 512 characters")
            return
        } 
        if (!anonymous) {
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
                todoDetail = ""
            })
            .catch((err) => console.log(err))
        } else {
            const newTodo = {id: crypto.randomUUID(), anonymous: true, details: todoDetail, completed: false}
            todos = [...todos, newTodo]
            localStorage.setItem("todos", JSON.stringify(todos))
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
        account_popup.showModal()
    }

    function deleteHandler(todo, todo_id) {
        if (anonymous) {
            todos = todos.filter(todoItem => todoItem !== todo)
            localStorage.setItem("todos", JSON.stringify(todos))
        } else {
            fetch(`${api_url}/todo/me`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({"id": todo_id})
            })
            .then(response => response.json())
            .then(data => {
                todos = todos.filter(todoItem => todoItem !== todo)
                localStorage.setItem("todos", JSON.stringify(todos))
            })
        }
        
    }

    function loginRedirect() {
        if (browser) {
            window.location.href = "/auth/login"
        }
    }

    onMount(async () => {
        await refresh(getTodos)
        const refreshInterval = setInterval(refresh, 870000)

        return () => {
            clearInterval(refreshInterval)
        }
    })
</script>

<svelte:head>
    <meta name="description" content="Sort out and declutter your schedule into peace with TodoZen">
    
    <title>TodoZen - Home</title>

</svelte:head>

{#if loading}


<main class="container">
    <div aria-busy="true">

    </div>
</main>
    
    
{:else}


{#if anonymous}
    <nav class="container-fluid">
        <ul>
            <li>TodoZen</li>
        </ul>
        <ul>
            <li><a role="button" href="#login" on:click={loginRedirect} id="loginButton">Login</a></li>
        </ul>
    </nav>
{:else}
    <nav class="container-fluid">
        <ul>
            <li>TodoZen</li>
        </ul>
        <ul>
            <li>
                <a role="button" href="#account" on:click={toggleAccountPopup} bind:this={toggle_account_popup} id="togglePopupButton">{username}</a>
            </li>
        </ul>
    </nav>
{/if}

<main class="container">

    {#if !anonymous}
    <dialog id="account-modal" bind:this={account_popup}>
        <article id="account-popup">
            <header>
                <a href="#close" aria-label="Close" class="close" on:click={account_popup.close()}></a>
                <h3>Account</h3>
            </header>
            <p>Username: {user.username}</p>
            <p>Email: {user.email}</p>
            <footer>
                <a href="#logout" on:click={logout} role="button" id="logout-button">Logout</a>
            </footer>
            
        </article>
    </dialog>
    {/if}
    
    <div id="createForm">
        
        <form on:submit={addTodo}>
            <div class="grid">
                <div><input type="text" name="detailsInput" id="detailsInput" bind:value={todoDetail} placeholder="Make coffee" required></div>
                <div><input type="submit" value="Add Task" id="formSubmit"></div>
            </div>
        </form>
    </div>
    
    <hr>
    
    {#if todos.length > 0}
    <div id="todos">
        {#each todos as todo, index (todo.id)}
            
            <Todo onDelete={deleteHandler} anonymous={anonymous} todo={todo} completed={todo.completed} details={todo.details} id={todo.id} />
            <hr>
        {/each}
    </div>
    {:else}
    <p id="no-todo-message">No todos yet</p>
    {/if}

    
</main>
{/if}