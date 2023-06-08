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
            <details role="list">
                <summary aria-haspopup="listbox" role="button" class="secondary">Theme</summary>
                <ul role="listbox">
                    <li><a href="#" data-theme-switcher="auto">Auto</a></li>
                    <li><a href="#" data-theme-switcher="light">Light</a></li>
                    <li><a href="#" data-theme-switcher="dark">Dark</a></li>
                </ul>
            </details>
            
        {/if}
    </div>
    
</article>