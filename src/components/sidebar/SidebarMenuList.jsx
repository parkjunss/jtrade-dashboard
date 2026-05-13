export default function SidebarMenuList({ activeItem, items, onSelect }) {
  const selectedItem = activeItem ?? items[0]?.id;

  return (
    <>
      {items.map(({ id, label, Icon }, idx) => (
        <button
          aria-label={label}
          className={selectedItem === id ? 'side-active' : 'side-btn'}
          data-label={label}
          key={id}
          onClick={() => onSelect?.(id)}
          type="button"
        >
          <Icon size={idx === 0 ? 24 : 19} />
        </button>
      ))}
    </>
  );
}
