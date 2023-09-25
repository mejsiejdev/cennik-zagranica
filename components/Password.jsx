"use client";

import { Input } from "@/components/ui/input";
import cookieCutter from "@boiseitguru/cookie-cutter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";

const Password = ({ lang }) => {
	const [pass, setPass] = useState("");
	const [error, setError] = useState(false);
	const router = useRouter();
	const authorize = async (e) => {
		e.preventDefault();
		await axios.post("/api/auth", { pass, lang }).then((data) => {
			setError(!data.data.authorized);
			cookieCutter.set("authorized", `${data.data.authorized}`);
			cookieCutter.set("lang", lang);
			router.refresh();
		});
	};

	return (
		<div className="h-[100dvh] w-[100dvw] flex items-center justify-center">
			<form onSubmit={authorize}>
				<h1 className="uppercase text-center">Password</h1>
				{error ? <p className="uppercase text-red-600 text-center">Wrong password</p> : ""}
				<Input
					className="w-96 my-4"
					onChange={(e) => setPass(e.target.value)}
					type="password"
					defaultValue={pass}
					placeholder="Password"
				/>
				<Button className="w-full">Unlock</Button>
			</form>
		</div>
	);
};

export default Password;
