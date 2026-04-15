import AuthSignInShell from "@/components/auth/AuthSignInShell";
import { SignInRightColumnSkeleton } from "@/components/auth/SignInRightColumnSkeleton";

export default function SignInLoading() {
  return (
    <AuthSignInShell>
      <SignInRightColumnSkeleton />
    </AuthSignInShell>
  );
}
