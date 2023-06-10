<script>
    import {onMount} from 'svelte'

    onMount(() => {
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
            <a class="contrast theme-switcher" on:click={toggle_theme} role="button" href="#">Toggle theme</a>
            
        {/if}
    </div>
    
</article>