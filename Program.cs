using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
})
.AddCookie()
.AddGoogle(googleOptions =>
{
    googleOptions.ClientId = "119010375707-3cbsqvkihqi0a0pj1est5816i351mmt2.apps.googleusercontent.com";
    googleOptions.ClientSecret = "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";
})
.AddMicrosoftAccount(microsoftOptions =>
{
    microsoftOptions.ClientId = "3e822fbe-f2ac-4b0f-b5e1-ef673f997847";
    microsoftOptions.ClientSecret = "5wQ8Q~S525KkNpOZAM_Au0okymgnMOF.UN174a9I";
});

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}
else
{
    app.UseDeveloperExceptionPage();
}

app.UseWebSockets();

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.MapControllerRoute(
    name: "chat",
    pattern: "Chat",
    defaults: new { controller = "Chat", action = "Chat" });

app.Run();
