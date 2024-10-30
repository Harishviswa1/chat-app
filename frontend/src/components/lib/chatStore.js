import { create } from "zustand";
import { useUserStore } from "./userStore";

export const useChatStore = create((set) => ({
    chatId: null,
    user: null,
    isCurrentUserBlocked: false,
    isReceiverBlocked: false,

    changeChat: (chatId, user) => {
        const currentUser = useUserStore.getState().currentUser;

        const isUserBlocked = user.blocked.includes(currentUser.id);

        const isCurrentUserBlocked = currentUser.blocked.includes(user.id);

        if (isUserBlocked) {
            return set({
                chatId,
                user: null,
                isCurrentUserBlocked: true,
                isReceiverBlocked: false,
            });
        } else if (isCurrentUserBlocked) {
            return set({
                chatId,
                user,
                isCurrentUserBlocked: false,
                isReceiverBlocked: true,
            });
        } else {
            return set({
                chatId,
                user,
                isCurrentUserBlocked: false,
                isReceiverBlocked: false,
            });
        }
    },

    changeBlock: () => {
        set((state) => ({
            ...state,
            isReceiverBlocked: !state.isReceiverBlocked,
        }));
    }
}));
