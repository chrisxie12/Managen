import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const mockFetch = (response) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: response.ok,
    json: async () => response.body,
  });
};

const mockFetchSequence = (...responses) => {
  global.fetch = jest.fn();
  responses.forEach((response) => {
    global.fetch.mockResolvedValueOnce({
      ok: response.ok,
      json: async () => response.body,
    });
  });
};

describe('Managen auth flows', () => {
  beforeEach(() => {
    localStorage.clear();
    global.fetch = jest.fn();
  });

  test('creates a school through the onboarding form and returns to login with the subdomain filled in', async () => {
    mockFetch({
      ok: true,
      body: {
        subdomain: 'greenvalley',
        loginUrl: 'http://localhost:3000/login?subdomain=greenvalley',
      },
    });

    render(<App />);

    await userEvent.click(screen.getByRole('tab', { name: /onboarding/i }));
    await userEvent.type(screen.getByLabelText(/school name/i), 'Green Valley School');
    await userEvent.type(screen.getByLabelText(/school email/i), 'admin@greenvalley.edu');
    await userEvent.type(screen.getByLabelText(/phone/i), '1234567890');
    await userEvent.type(screen.getByLabelText(/admin name/i), 'Jane Admin');
    await userEvent.type(screen.getByLabelText(/admin password/i), 'Password123!');
    await userEvent.selectOptions(screen.getByLabelText(/plan/i), 'trial');
    await userEvent.click(screen.getByRole('button', { name: /create school/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    const [requestUrl, requestOptions] = global.fetch.mock.calls[0];
    expect(requestUrl).toBe('/api/onboard/signup');
    expect(requestOptions.method).toBe('POST');
    expect(JSON.parse(requestOptions.body)).toEqual({
      schoolName: 'Green Valley School',
      email: 'admin@greenvalley.edu',
      phone: '1234567890',
      adminName: 'Jane Admin',
      adminPassword: 'Password123!',
      plan: 'trial',
    });

    expect(await screen.findByRole('status')).toHaveTextContent(/school created successfully/i);
    expect(screen.getByRole('tab', { name: /login/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByLabelText(/school subdomain/i)).toHaveValue('greenvalley');
  });

  test('logs in, stores the token, and shows a success message', async () => {
    mockFetch({
      ok: true,
      body: {
        token: 'jwt-token',
        user: { name: 'Jane Admin', email: 'admin@greenvalley.edu' },
      },
    });

    render(<App />);

    await userEvent.type(screen.getByLabelText(/school subdomain/i), 'greenvalley');
    await userEvent.type(screen.getByLabelText(/^email$/i), 'admin@greenvalley.edu');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    const [requestUrl, requestOptions] = global.fetch.mock.calls[0];
    expect(requestUrl).toBe('/api/auth/login');
    expect(requestOptions.method).toBe('POST');
    expect(JSON.parse(requestOptions.body)).toEqual({
      subdomain: 'greenvalley',
      email: 'admin@greenvalley.edu',
      password: 'Password123!',
    });

    expect(localStorage.getItem('schoolosToken')).toBe('jwt-token');
    expect(await screen.findByRole('status')).toHaveTextContent(/welcome back, jane admin/i);
  });

  test('logs out a tenant session and clears the stored token', async () => {
    mockFetchSequence(
      {
        ok: true,
        body: {
          token: 'jwt-token',
          user: { name: 'Jane Admin', email: 'admin@greenvalley.edu' },
        },
      },
      {
        ok: true,
        body: {
          message: 'Logged out successfully.',
        },
      }
    );

    render(<App />);

    await userEvent.type(screen.getByLabelText(/school subdomain/i), 'greenvalley');
    await userEvent.type(screen.getByLabelText(/^email$/i), 'admin@greenvalley.edu');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'Password123!');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/welcome back, jane admin/i));

    await userEvent.click(screen.getByRole('button', { name: /sign out tenant/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));

    const [, logoutOptions] = global.fetch.mock.calls[1];
    expect(global.fetch.mock.calls[1][0]).toBe('/api/auth/logout');
    expect(logoutOptions.method).toBe('POST');
    expect(logoutOptions.headers.Authorization).toBe('Bearer jwt-token');
    expect(await screen.findByRole('status')).toHaveTextContent(/signed out successfully/i);
    expect(screen.queryByRole('button', { name: /sign out tenant/i })).not.toBeInTheDocument();
  });

  test('shows validation feedback and does not call the API for empty login submissions', async () => {
    render(<App />);

    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    expect(global.fetch).not.toHaveBeenCalled();
    expect(screen.getByRole('status')).toHaveTextContent(/email and password are required/i);
  });

  test('opens the super-admin dashboard and stores the admin token separately', async () => {
    mockFetchSequence(
      {
        ok: true,
        body: {
          token: 'super-admin-token',
          message: 'Welcome, Super Admin!',
        },
      },
      {
        ok: true,
        body: {
          stats: {
            totalSchools: 42,
            activeSchools: 35,
            trialSchools: 5,
            suspended: 2,
            totalRevenue: 12345,
          },
          planBreakdown: [
            { plan: 'trial', count: 5 },
            { plan: 'growth', count: 12 },
            { plan: 'pro', count: 18 },
            { plan: 'enterprise', count: 7 },
          ],
        },
      }
    );

    render(<App />);

    await userEvent.click(screen.getByRole('tab', { name: /super admin/i }));
    await userEvent.type(screen.getByLabelText(/^email$/i), 'admin@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'SuperSecret123!');
    await userEvent.click(screen.getByRole('button', { name: /open dashboard/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));

    const [loginUrl, loginOptions] = global.fetch.mock.calls[0];
    expect(loginUrl).toBe('/api/superadmin/login');
    expect(loginOptions.method).toBe('POST');
    expect(JSON.parse(loginOptions.body)).toEqual({
      email: 'admin@example.com',
      password: 'SuperSecret123!',
    });

    const [dashboardUrl, dashboardOptions] = global.fetch.mock.calls[1];
    expect(dashboardUrl).toBe('/api/superadmin/dashboard');
    expect(dashboardOptions.headers.Authorization).toBe('Bearer super-admin-token');

    expect(await screen.findByRole('status')).toHaveTextContent(/super admin dashboard loaded/i);
    expect(screen.getByText(/total schools/i)).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('12345')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /plan breakdown/i })).toBeInTheDocument();
  });

  test('signs out a super-admin session locally and clears the dashboard', async () => {
    mockFetchSequence(
      {
        ok: true,
        body: {
          token: 'super-admin-token',
          message: 'Welcome, Super Admin!',
        },
      },
      {
        ok: true,
        body: {
          stats: {
            totalSchools: 42,
            activeSchools: 35,
            trialSchools: 5,
            suspended: 2,
            totalRevenue: 12345,
          },
          planBreakdown: [{ plan: 'trial', count: 5 }],
        },
      }
    );

    render(<App />);

    await userEvent.click(screen.getByRole('tab', { name: /super admin/i }));
    await userEvent.type(screen.getByLabelText(/^email$/i), 'admin@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'SuperSecret123!');
    await userEvent.click(screen.getByRole('button', { name: /open dashboard/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(2));

    await userEvent.click(screen.getByRole('button', { name: /sign out super admin/i }));

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect(localStorage.getItem('schoolosSuperAdminToken')).toBeNull();
    expect(await screen.findByRole('status')).toHaveTextContent(/super admin signed out successfully/i);
    expect(screen.queryByRole('heading', { name: /plan breakdown/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /sign out super admin/i })).not.toBeInTheDocument();
  });

  test('shows super-admin login errors without loading the dashboard', async () => {
    mockFetch({
      ok: false,
      body: {
        message: 'Invalid credentials.',
      },
    });

    render(<App />);

    await userEvent.click(screen.getByRole('tab', { name: /super admin/i }));
    await userEvent.type(screen.getByLabelText(/^email$/i), 'bad@example.com');
    await userEvent.type(screen.getByLabelText(/^password$/i), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: /open dashboard/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/invalid credentials/i));
    expect(localStorage.getItem('schoolosSuperAdminToken')).toBeNull();
  });
});

