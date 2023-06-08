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

    let settings_modal

    let user = {};
    let username = ""
    let page = "account"

    let isLight = true

    function accountPage() {
        page = "account"
    }

    function themePage() {
        page = "theme"
    }



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
        isLight = Boolean(localStorage.getItem("isLight"))
        document.documentElement.setAttribute('data-theme', isLight ? 'light' : 'dark')
        await refresh(getTodos)
        const refreshInterval = setInterval(refresh, 870000)

        

        return () => {
            clearInterval(refreshInterval)
        }
    })

    function settings() {
        account_popup.close()
        settings_modal.showModal()
    }



    function toggleTheme() {
        document.documentElement.setAttribute('data-theme', isLight ? 'light' : 'dark')
        isLight = isLight ? false : true
        localStorage.setItem("isLight", String(isLight))
    }
</script>

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
                <a href="#settings" on:click={settings} role="button" id="settings-button">Settings</a>
                <a href="#logout" on:click={logout} role="button" id="logout-button">Logout</a>
            </footer>
            
        </article>
    </dialog>

    <dialog id="settings-modal" bind:this={settings_modal}>
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
                <aside>
                    <nav>
                        <ul>
                            <li><a href="#account-settings" on:click={accountPage}>Account</a></li>
                            <li><a href="#theme" on:click={themePage}>Theme</a></li>
                        </ul>
                    </nav>
                </aside>
                {#if page === "account"}
                    <h2>Change username</h2>
                    WIP
                    <hr>
                    <h2>Change email</h2>
                    WIP
                    <hr>
                    <h2>Reset password</h2>
                    WIP
                    <hr>
                {:else}
                    <h2>Select Theme</h2>
                    <a class="contrast theme-switcher" on:click={toggleTheme} role="button" href="#">Toggle theme</a>
                    
                {/if}
            </div>
            
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