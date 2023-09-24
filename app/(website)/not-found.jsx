import { config } from "@/config/config";
import { country } from "@/lib/utils";
import Link from "next/link";

const NotFound = () => {
	const availLangs = [...new Set(config.source.map((src) => src.lang))];
	return (
		<div className="h-screen flex flex-col items-center justify-center">
			<h1 className="text-7xl font-bold mb-4">404</h1>
			<p className="uppercase mb-20">Page not found</p>
			<p className="mb-4 uppercase font-medium">Available pages:</p>
			<div className="grid grid-cols-4 items-center gap-2">
				{availLangs.map((avail) => (
					<Link className="py-2 px-4 hover:underline" key={avail} href={`/${avail}`}>
						{country(avail)}
					</Link>
				))}
			</div>
		</div>
	);
};

export default NotFound;
