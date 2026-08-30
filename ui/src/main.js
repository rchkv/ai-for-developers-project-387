import "@shoelace-style/shoelace/dist/themes/light.css";
import { setBasePath } from "@shoelace-style/shoelace/dist/utilities/base-path.js";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/card/card.js";
import "@shoelace-style/shoelace/dist/components/icon/icon.js";
import "@shoelace-style/shoelace/dist/components/alert/alert.js";
import "@shoelace-style/shoelace/dist/components/dialog/dialog.js";
import "@shoelace-style/shoelace/dist/components/select/select.js";
import "@shoelace-style/shoelace/dist/components/option/option.js";
import "@shoelace-style/shoelace/dist/components/input/input.js";
import "@shoelace-style/shoelace/dist/components/textarea/textarea.js";
import "./styles/main.css";

import { route, initRouter } from "./router.js";
import { renderLayout } from "./components/layout.js";
import { renderGuestEvents } from "./pages/GuestEvents.js";
import { renderGuestEventSlots } from "./pages/GuestEventSlots.js";
import { renderAdminEvents } from "./pages/AdminEvents.js";
import { renderAdminSlots } from "./pages/AdminSlots.js";
import { renderAdminBookings } from "./pages/AdminBookings.js";

setBasePath("/shoelace");

const root = document.getElementById("app");
renderLayout(root);

route("/", renderGuestEvents);
route("/events/:id", renderGuestEventSlots);
route("/admin", (container) => renderAdminEvents(container));
route("/admin/events", renderAdminEvents);
route("/admin/slots", renderAdminSlots);
route("/admin/bookings", renderAdminBookings);

initRouter();
