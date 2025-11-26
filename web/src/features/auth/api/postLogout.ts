export async function postLogout() {
	const response = await fetch("/api/auth/logout", {
		method: "POST",
	});

	if (!response.ok) {
		throw new Error("Logout failed");
	}

	return { success: true };
}
