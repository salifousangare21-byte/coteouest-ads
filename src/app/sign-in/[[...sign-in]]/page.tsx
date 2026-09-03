import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[var(--light-gray)] px-6 py-24">
      <SignIn
        appearance={{
          variables: {
            colorPrimary: "#111111",
            fontFamily: "'Inter', sans-serif",
            borderRadius: "0px",
          },
        }}
      />
    </div>
  );
}
