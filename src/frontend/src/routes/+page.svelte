<script>
    import {onMount} from 'svelte'
    import {browser} from '$app/environment'
    import Todo from '$lib/Todo.svelte'
    import Settings from '$lib/Settings.svelte';

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

    let dueDateInput

    let username = ""

    let isLight

    let form_has_due_date = false

    let due_date_modal

    let due_date

    let create_new_todo_modal

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
        } else if (todoDetail.length === 0){
            alert("Todo must have detail")
            return
        } else if (form_has_due_date && due_date == undefined) {
            alert("Specify the due date please")
            return
        }
        create_new_todo_modal.close()
        console.log(due_date)
        if (!anonymous) {
            fetch(`${api_url}/todo/me`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    details: todoDetail,
                    due_date: due_date
                }),
            })
            .then((response) => response.json())
            .then((data) => {
                todos = [...todos, data]
                todoDetail = ""
            })
            .catch((err) => console.log(err))
        } else {
            const newTodo = {id: crypto.randomUUID(), anonymous: true, details: todoDetail, completed: false, due_date: due_date}
            todos = [...todos, newTodo]
            localStorage.setItem("todos", JSON.stringify(todos))
        }
        
    }

    function logout() {
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
        isLight = (localStorage.getItem("isLight") === "true")
        if (isLight === true) {
            document.documentElement.setAttribute('data-theme', 'light')
        } else if (isLight === false) {
            document.documentElement.setAttribute('data-theme', 'dark')
        } else {
            document.documentElement.setAttribute('data-theme', 'auto')
        }
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
        document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light')
        isLight = !isLight
        localStorage.setItem("isLight", String(isLight))
    }

    function dueDateShow() {
        console.log(form_has_due_date)
        if (form_has_due_date) {
            
            dueDateInput.style.display = "inline"
        } else {
            dueDateInput.style.display = "none"
        }
    }

    function submitDueDate() {
        due_date_modal.close()
        console.log(due_date)
    }

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
            <li><a data-placement="bottom" data-tooltip="Back home" aria-label="Back home" class="contrast" href="/">TodoZen</a></li>
        </ul>
        <ul>
            <li><a role="button" href="#toggle" class="contrast theme-switcher" on:click={toggleTheme}>Toggle theme</a></li>
            <li><a role="button" href="#login" on:click={loginRedirect} id="loginButton">Login</a></li>
        </ul>
    </nav>
{:else}
    <nav class="container-fluid">
        <ul>
            <li><a data-placement="bottom" data-tooltip="Back home" aria-label="Back home" class="contrast" href="/">TodoZen</a></li>
        </ul>
        <ul>
            <li><a role="button" href="#toggle" class="contrast theme-switcher" on:click={toggleTheme}>Toggle theme</a></li>
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
        <Settings popup={settings_modal} toggle_theme={toggleTheme} />
    </dialog>
    {/if}
    
    <a href="#create" on:click={create_new_todo_modal.showModal()}>
        <strong>+</strong> Create new todo
    </a>

    <dialog bind:this={create_new_todo_modal} id="create-new-todo-modal">
        <article>
            <header>
                <a href="#close" class="close" on:click={create_new_todo_modal.close()}>
                </a>
                Create new task
            </header>
            <form>
                <input type="text" name="detailsInput" id="detailsInput" bind:value={todoDetail} placeholder="Enter description">

                <div style="margin-bottom: 5px;">
                    Due date? <input bind:checked={form_has_due_date} on:change={dueDateShow} type="checkbox" style="margin-right: 1%">
                </div>
                
                <input type="date" style="display: none;" bind:this={dueDateInput} bind:value={due_date}>
                
            </form>
            <footer>
                <a on:click={create_new_todo_modal.close()} href="#cancel">
                    Cancel
                </a>
                <a on:click={addTodo} href="#addTodo" type="submit" role="button" id="formSubmit">
                    Accept
                </a>
            </footer>
        </article>
            
        
    </dialog>
    
    <hr>
    
    {#if todos.length > 0}
    <div id="todos">
        {#each todos as todo, index (todo.id)}
            
            <Todo onDelete={deleteHandler} anonymous={anonymous} todo={todo} completed={todo.completed} details={todo.details} id={todo.id} due_date={todo.due_date}/>
            <hr>
        {/each}
    </div>
    {:else}
    <p id="no-todo-message">No todos yet</p>
    {/if}

    
</main>
{/if}