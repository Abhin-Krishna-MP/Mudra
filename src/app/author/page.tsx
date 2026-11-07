import { redirect } from 'next/navigation';

export default function AuthorPage() {
  redirect('/author/dashboard');
}
