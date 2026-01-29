export default function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <nav className="p-4 border-b">Navbar Landing Page</nav>
      <main className="flex-grow">{children}</main>
      <footer className="p-4 bg-gray-100">Footer</footer>
    </div>
  );
}