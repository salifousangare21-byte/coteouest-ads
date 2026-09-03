import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex-1 flex items-center justify-center bg-[var(--light-gray)] px-6 py-24">
      <SignUp
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
