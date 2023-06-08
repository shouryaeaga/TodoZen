<script>
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
        <h1>Settings</h1>
        {#if page === "account"}
        <h3>Account</h3>
        {:else}
        <h3>Theme</h3>
        {/if}
    </header>
    <aside>
        <nav>
            <ul>
                <li><a href="#account-settings" on:click={accountPage}>Account</a></li>
                <li><a href="#theme" on:click={themePage}>Theme</a></li>
            </ul>
        </nav>
    </aside>
    <div class="container">
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
            <ul role="listbox">
                <li><a href="#" data-theme-switcher="auto">Auto</a></li>
                <li><a href="#" data-theme-switcher="light">Light</a></li>
                <li><a href="#" data-theme-switcher="dark">Dark</a></li>
            </ul>
        {/if}
    </div>
</article>