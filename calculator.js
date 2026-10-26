(function () {
  "use strict";

  // ---- NQ position size calculator (nq-position-size-calculator.html) ----
  // Kept in its own file because the Content-Security-Policy in _headers blocks inline scripts.
  var form = document.getElementById("calc");
  if (!form) return;

  var customWrap = document.getElementById("custom-wrap");
  var out = {
    contracts: document.getElementById("out-contracts"),
    unit: document.getElementById("out-unit"),
    budget: document.getElementById("out-budget"),
    per: document.getElementById("out-per"),
    risk: document.getElementById("out-risk"),
    streakLabel: document.querySelector("#out-streak").previousElementSibling,
    streak: document.getElementById("out-streak"),
    note: document.getElementById("out-note")
  };

  function num(id) {
    var v = parseFloat(document.getElementById(id).value);
    return isFinite(v) ? v : NaN;
  }
  function usd(v) {
    return v.toLocaleString("en-US", { style: "currency", currency: "USD" });
  }
  function plural(n, word) {
    return n === 1 ? word : word + "s";
  }
  function clear(message) {
    out.contracts.textContent = "–";
    out.unit.textContent = "";
    out.budget.textContent = out.per.textContent = out.risk.textContent = out.streak.textContent = "–";
    out.note.textContent = message;
  }

  function update() {
    var choice = form.querySelector("input[name=instrument]:checked").value;
    var custom = choice === "custom";
    customWrap.hidden = !custom;

    var ppv = custom ? num("ppv") : parseFloat(choice);
    var name = custom ? "contract" : (choice === "20" ? "NQ contract" : "MNQ contract");
    var dll = num("dll");
    var dd = num("dd");
    var streak = Math.floor(num("streak"));
    var stop = num("stop");
    var fees = num("fees");
    if (!(fees >= 0)) fees = 0;

    if (custom && !(ppv > 0)) return clear("Enter the value of 1 point for your instrument.");
    if (!(dll > 0)) return clear("Enter your daily loss limit.");
    if (!(streak >= 1)) return clear("Enter how many stopped-out trades in a row you want to survive (1 or more).");
    if (!(stop > 0)) return clear("Enter your stop distance in points.");

    // The budget is the daily loss limit, or the room left to max drawdown if that is smaller.
    var limit = dd > 0 ? Math.min(dll, dd) : dll;
    var budget = limit / streak;
    var perContract = stop * ppv + fees;
    var contracts = Math.floor(budget / perContract + 1e-9);
    var risk = contracts * perContract;
    var ticks = stop * 4;

    out.contracts.textContent = String(contracts);
    out.unit.textContent = custom ? (contracts === 1 ? "contract or lot" : "contracts or lots") : plural(contracts, name);
    out.budget.textContent = usd(budget);
    // Ticks (0.25 pt) only mean something on NQ and MNQ; a CFD's price step depends on the broker.
    out.per.textContent = usd(perContract) + (!custom && Number.isInteger(ticks) ? " (" + ticks + " ticks)" : "");
    out.risk.textContent = contracts ? usd(risk) : "–";
    out.streakLabel.textContent = "Loss after " + streak + " " + plural(streak, "stop") + " in a row";
    out.streak.textContent = contracts ? usd(risk * streak) + " · " + Math.round((risk * streak / limit) * 100) + "% of your " + (limit < dll ? "drawdown room" : "limit") : "–";

    if (contracts === 0) {
      var note = "Even 1 " + name + " risks " + usd(perContract) + ", more than your " + usd(budget) + " budget per trade.";
      if (choice === "20") {
        var micro = Math.floor(budget / (stop * 2 + fees) + 1e-9);
        if (micro > 0) note += " On MNQ (a tenth of the size) that’s " + micro + " " + plural(micro, "contract") + ".";
      }
      out.note.textContent = note + " A tighter stop or fewer stops in a row would also change the answer.";
    } else {
      out.note.textContent = "Rounded down to whole contracts. A stop can fill worse than its price in a fast market.";
    }
  }

  form.addEventListener("input", update);
  form.addEventListener("change", update);
  // The CSP blocks form submission (form-action 'none'): pressing Enter just recalculates.
  form.addEventListener("submit", function (e) { e.preventDefault(); update(); });
  update();
})();
