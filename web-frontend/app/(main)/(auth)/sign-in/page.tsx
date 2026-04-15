import { Suspense } from "react";
import AuthSignInShell from "@/components/auth/AuthSignInShell";
import { SignInRightColumnSkeleton } from "@/components/auth/SignInRightColumnSkeleton";
import SignInForm from "@/components/forms/SignInForm";

const SigninPage = () => {
  return (
    <AuthSignInShell>
      <Suspense fallback={<SignInRightColumnSkeleton />}>
        <SignInForm />
      </Suspense>
    </AuthSignInShell>
  );
};

export default SigninPage;
