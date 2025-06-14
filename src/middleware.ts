import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function middleware(request: NextRequest) {
  // wrap as NextResponse
  let modifiedResponse = NextResponse.next({
    request,
  });

  const path = new URL(request.url).pathname;

  const protectedRoutes = ['/protected'];
  const authRoutes = ['/login', '/create-account'];
  const pythonRoutes = ['/api/python'];

  //   exact match only
  const isProtectedRoute = protectedRoutes.includes(path);
  const isAuthRoute = authRoutes.includes(path);
  //   folder route protection
  const isPythonRoute = pythonRoutes.some((route) => path.startsWith(route));

  const user = await getUser(modifiedResponse, request);

  if (isProtectedRoute) {
    // still passing the response to allow cookie setting for db client (current jwt)
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }
  if (isPythonRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    //proxy the api/python path to external domain
    const routePath = path.replace('/api/python', '');
    const externalUrl = new URL(
      `/api${routePath}`,
      process.env.EXTERNAL_PYTHON_URL
    );
    // const extHeaders = new Headers(request.headers);
    // extHeaders.set('user-id', `${user.id}`);
    // console.log(extHeaders);
    console.log(
      JSON.stringify(
        NextResponse.rewrite(externalUrl, {
          request: { headers: request.headers },
        }).headers
      )
    );
    // expect
    // {'user-id': '' }//type uuid within the headers
    // TODO: confirm header 'user-id' is passed correctly to server (console log reqs on server?)
    return NextResponse.rewrite(externalUrl, {
      request: { headers: request.headers },
    });
  }
  if (isAuthRoute) {
    if (!user) {
      return NextResponse.next();
    } else {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }
  return NextResponse.next();
  //   return await updateSession(request);
}

export const config = {
  // routes to run middleware on
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  //   pass cookies (jwt auth) from the browser client via request forwarding
  const supabaseClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // cookie handlers, use
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}

export async function getUser(response: NextResponse, request: NextRequest) {
  //   pass cookies (jwt auth) from the browser client via request forwarding
  const supabaseClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  return user;
}
