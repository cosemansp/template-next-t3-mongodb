import { withAuth } from "next-auth/middleware";

// standard middleware
// import { NextRequest, NextResponse } from "next/server";
// export function middleware(request: NextRequest, response: NextResponse) {
//   console.log(">>>>>>", request.url);
// }

export default withAuth(
  function middleware() {
    // console.log(">>>>>>", req.nextauth);
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|favicon.ico|signIn).*)",
  ],
};
