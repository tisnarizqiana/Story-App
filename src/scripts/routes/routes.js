import HomePage from "../pages/home/home-page";
import NewPage from "../pages/new/new-page";
import RegisterPage from "../pages/register/register-page";
import LoginPage from "../pages/login/login-page";
import BookmarkPage from "../pages/bookmark/bookmark-page";
import {
  checkAuthenticatedRoute,
  checkUnauthenticatedRouteOnly,
} from "../utils/auth";

const routes = {
  "/home": () => checkAuthenticatedRoute(new HomePage()),
  "/new": () => checkAuthenticatedRoute(new NewPage()),
  "/bookmarks": () => checkAuthenticatedRoute(new BookmarkPage()),
  "/login": () => checkUnauthenticatedRouteOnly(new LoginPage()),
  "/register": () => checkUnauthenticatedRouteOnly(new RegisterPage()),
  "/": () => checkAuthenticatedRoute(new HomePage()),
};

export default routes;
