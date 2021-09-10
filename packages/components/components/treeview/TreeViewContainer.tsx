import { ReactNode } from 'react';

export interface Props {
    role?: string;
    children: ReactNode;
}

const TreeViewContainer = ({ role = 'tree', children }: Props) => {
    return (
        <ul role={role} className="treeview-container unstyled mt0 mb0">
            {children}
        </ul>
    );
};

export default TreeViewContainer;
